from django.db import transaction
from rest_framework import serializers

from climateconnect_api.utility.html import sanitize_html
from organization.models.event_registration import RegistrationFieldAnswer
from organization.models.registration_field import (
    RegistrationField,
    RegistrationFieldOption,
    RegistrationFieldType,
)

# ---------------------------------------------------------------------------
# Type-specific settings serializers
# ---------------------------------------------------------------------------


class CheckboxSettingsSerializer(serializers.Serializer):
    """
    Validates and sanitizes the settings dict for checkbox fields.

    description is stored as sanitized HTML (bold + links only). Unknown keys
    are ignored (DRF strips undeclared fields from to_internal_value output).
    """

    description = serializers.CharField(allow_blank=True, default="")

    def validate_description(self, value):
        return sanitize_html(value)


class OptionSelectSettingsSerializer(serializers.Serializer):
    """
    Settings serializer for option_select fields.

    title is the question label shown above the options (e.g. "Meal preference?").
    Options themselves live in RegistrationFieldOption rows.
    """

    title = serializers.CharField(required=False, allow_blank=True)


class InventorySettingsSerializer(serializers.Serializer):
    """
    Settings serializer for inventory fields.

    title is the question label (e.g. "Meal tickets"). Required on publish.
    description is optional helper text shown below the title.
    """

    title = serializers.CharField(max_length=100, required=False, allow_blank=True)
    description = serializers.CharField(
        max_length=200, required=False, allow_blank=True
    )


FIELD_TYPE_SETTINGS_VALIDATORS = {
    RegistrationFieldType.CHECKBOX: CheckboxSettingsSerializer,
    RegistrationFieldType.OPTION_SELECT: OptionSelectSettingsSerializer,
    RegistrationFieldType.INVENTORY: InventorySettingsSerializer,
}


# ---------------------------------------------------------------------------
# Field option serializer
# ---------------------------------------------------------------------------


class RegistrationFieldOptionSerializer(serializers.ModelSerializer):
    """
    Serializes a single selectable option within an option_select field.

    id is optional on write:
      - Absent → create new option.
      - Present → identify an existing option for update.

    has_answers (read-only): True if any RegistrationFieldAnswer row references
    this option as value_option. The frontend uses this to lock the title field.
    """

    id = serializers.IntegerField(required=False, allow_null=True)
    has_answers = serializers.SerializerMethodField()
    available_amount = serializers.IntegerField(
        required=False, allow_null=True, min_value=1
    )
    max_amount_per_guest = serializers.IntegerField(
        required=False, allow_null=True, min_value=1
    )

    class Meta:
        model = RegistrationFieldOption
        fields = [
            "id",
            "title",
            "order",
            "has_answers",
            "available_amount",
            "max_amount_per_guest",
        ]
        extra_kwargs = {
            "title": {"max_length": 200},
            "order": {"min_value": 0},
        }

    def get_has_answers(self, obj):
        if not obj.pk:
            return False
        return RegistrationFieldAnswer.objects.filter(value_option=obj).exists()


# ---------------------------------------------------------------------------
# Field serializer
# ---------------------------------------------------------------------------


class RegistrationFieldSerializer(serializers.ModelSerializer):
    """
    Serializes a single custom registration field.

    Write path
    ----------
    id absent  → create new field; field_type is required.
    id present → update existing field; field_type is optional.

    settings is validated against the per-type registry (unknown keys are
    stripped). Publish-time validation (non-empty description for checkbox,
    at least one option for option_select) is enforced when is_draft=False
    is in context.

    options is optional on write. When absent, existing options are left
    untouched (only relevant for updates). When present (even as []), the
    full option set for the field is synced.

    has_answers (read-only): True if any RegistrationFieldAnswer row references
    this field. The frontend uses this to lock text inputs (checkbox description,
    option select title) that cannot be changed once answers exist.

    label: Required, max 30 characters, unique within the registration config.
    Used as the organiser-facing field identifier in exports, prints, and overview.
    """

    id = serializers.IntegerField(required=False, allow_null=True)
    field_type = serializers.ChoiceField(
        choices=RegistrationFieldType.choices, required=False
    )
    label = serializers.CharField(max_length=30, required=True, allow_blank=False)
    settings = serializers.JSONField(required=False)
    options = RegistrationFieldOptionSerializer(many=True, required=False)
    has_answers = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationField
        fields = [
            "id",
            "field_type",
            "order",
            "is_required",
            "label",
            "settings",
            "options",
            "has_answers",
        ]
        extra_kwargs = {
            "order": {"min_value": 0},
            "is_required": {"required": False, "default": False},
        }

    def get_has_answers(self, obj):
        if not obj.pk:
            return False
        return RegistrationFieldAnswer.objects.filter(field=obj).exists()

    def validate(self, attrs):
        field_id = attrs.get("id")
        field_type = attrs.get("field_type")

        # Creating a new field: field_type is required to dispatch settings validation.
        if not field_id and not field_type:
            raise serializers.ValidationError(
                {"field_type": "Required when creating a new field."}
            )

        # Validate and strip settings using the type-specific registry.
        if field_type and field_type in FIELD_TYPE_SETTINGS_VALIDATORS:
            raw_settings = attrs.get("settings") or {}
            settings_cls = FIELD_TYPE_SETTINGS_VALIDATORS[field_type]
            settings_ser = settings_cls(data=raw_settings)
            if not settings_ser.is_valid():
                raise serializers.ValidationError({"settings": settings_ser.errors})
            attrs["settings"] = settings_ser.validated_data
        elif "settings" in attrs and "description" in (attrs["settings"] or {}):
            # field_type unknown (update with no field_type sent) but description
            # is present — sanitize defensively to prevent stored XSS.
            attrs["settings"] = {
                **attrs["settings"],
                "description": sanitize_html(attrs["settings"]["description"]),
            }

        # Publish-time per-field validation (skipped in draft mode).
        is_draft = self.context.get("is_draft", True)
        if not is_draft and field_type:
            if field_type == RegistrationFieldType.CHECKBOX:
                description = (attrs.get("settings") or {}).get("description", "")
                if not description or not description.strip():
                    raise serializers.ValidationError(
                        {
                            "settings": {
                                "description": ("Required when publishing an event.")
                            }
                        }
                    )
            elif field_type == RegistrationFieldType.OPTION_SELECT:
                if not attrs.get("options"):
                    raise serializers.ValidationError(
                        {
                            "options": (
                                "At least one option is required when publishing an event."
                            )
                        }
                    )
            elif field_type == RegistrationFieldType.INVENTORY:
                title = (attrs.get("settings") or {}).get("title", "")
                if not title or not title.strip():
                    raise serializers.ValidationError(
                        {"settings": {"title": "Required when publishing an event."}}
                    )
                options = attrs.get("options")
                if not options:
                    raise serializers.ValidationError(
                        {
                            "options": (
                                "At least one option is required when publishing an event."
                            )
                        }
                    )
                for i, opt in enumerate(options):
                    if not opt.get("available_amount"):
                        raise serializers.ValidationError(
                            {
                                "options": {
                                    i: {
                                        "available_amount": (
                                            "Required when publishing an event."
                                        )
                                    }
                                }
                            }
                        )
                    if not opt.get("max_amount_per_guest"):
                        raise serializers.ValidationError(
                            {
                                "options": {
                                    i: {
                                        "max_amount_per_guest": (
                                            "Required when publishing an event."
                                        )
                                    }
                                }
                            }
                        )

        return attrs


# ---------------------------------------------------------------------------
# Sync helpers (used by EventRegistrationConfig serializers)
# ---------------------------------------------------------------------------


def _sync_options(field, options_data):
    """
    Sync the options list for a single RegistrationField.

    items with id   → update existing option
    items without id → create new option
    existing options absent from options_data → delete

    Runs inside the caller's atomic transaction. The DEFERRED unique constraint
    on (field, order) allows reordering without temporary conflicts.
    """
    existing = {o.id: o for o in field.options.all()}
    incoming_ids = set()

    for opt_data in options_data:
        opt_id = opt_data.pop("id", None)
        if opt_id is not None:
            incoming_ids.add(opt_id)
            opt = existing.get(opt_id)
            if opt is not None:
                for key, val in opt_data.items():
                    setattr(opt, key, val)
                opt.save()
        else:
            RegistrationFieldOption.objects.create(field=field, **opt_data)

    # Delete options absent from the submitted array.
    to_delete = [oid for oid in existing if oid not in incoming_ids]
    if to_delete:
        RegistrationFieldOption.objects.filter(id__in=to_delete).delete()


def _validate_labels_unique(fields_data, registration_config):
    """
    Validate that all labels in fields_data are non-empty, ≤ 30 chars, and unique
    within the registration config (including existing fields not in the payload).
    """
    seen_labels = set()
    for field_data in fields_data:
        label = field_data.get("label")
        if not label or not label.strip():
            raise serializers.ValidationError({"label": "This field may not be blank."})
        if len(label) > 30:
            raise serializers.ValidationError(
                {"label": "Ensure this field has no more than 30 characters."}
            )
        normalized = label.strip().lower()
        if normalized in seen_labels:
            raise serializers.ValidationError(
                {"label": "Label already used by another field."}
            )
        seen_labels.add(normalized)
    existing_labels = set(
        registration_config.fields.exclude(
            id__in=[f.get("id") for f in fields_data if f.get("id")]
        ).values_list("label", flat=True)
    )
    for field_data in fields_data:
        label = field_data.get("label")
        if label and label.strip().lower() in {existing_label.lower() for existing_label in existing_labels}:
            raise serializers.ValidationError(
                {"label": "Label already used by another field."}
            )


@transaction.atomic
def sync_fields(registration_config, fields_data):
    """
    Sync the full field set for an EventRegistrationConfig.

    items with id   → update existing field (and sync its options)
    items without id → create new field (and create its options)
    existing fields absent from fields_data → delete (guard: no answers in Phase 4a)

    Runs in a single atomic transaction. The DEFERRED unique constraint on
    (registration_config, order) allows reordering in any order within the
    transaction without hitting intermediate violations.
    """
    existing = {f.id: f for f in registration_config.fields.all()}
    incoming_ids = set()

    _validate_labels_unique(fields_data, registration_config)

    for field_data in fields_data:
        # Pop write-only / non-model fields before setting attributes.
        field_id = field_data.pop("id", None)
        options_data = field_data.pop("options", None)

        if field_id is not None:
            incoming_ids.add(field_id)
            field = existing.get(field_id)
            if field is not None:
                for key, val in field_data.items():
                    setattr(field, key, val)
                field.save()
                if options_data is not None:
                    _sync_options(field, options_data)
        else:
            # Strip any accidental id from deeply nested create data.
            field_data.pop("id", None)
            field = RegistrationField.objects.create(
                registration_config=registration_config,
                **field_data,
            )
            if options_data:
                for opt_data in options_data:
                    opt_data.pop("id", None)
                    RegistrationFieldOption.objects.create(field=field, **opt_data)

    # Delete fields absent from the submitted array.
    # RegistrationFieldAnswer rows are removed automatically via DB CASCADE.
    to_delete = [fid for fid in existing if fid not in incoming_ids]
    if to_delete:
        RegistrationField.objects.filter(id__in=to_delete).delete()


def create_fields(registration_config, fields_data):
    """
    Create all fields (and their options) for a newly created config.

    Called from EventRegistrationConfigSerializer.create(). Runs inside the
    caller's atomic context (no new transaction needed).
    """
    _validate_labels_unique(fields_data, registration_config)
    for field_data in fields_data:
        field_data.pop("id", None)
        options_data = field_data.pop("options", None) or []
        field = RegistrationField.objects.create(
            registration_config=registration_config,
            **field_data,
        )
        for opt_data in options_data:
            opt_data.pop("id", None)
            RegistrationFieldOption.objects.create(field=field, **opt_data)
