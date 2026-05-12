from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationFieldAnswer,
    RegistrationStatus,
)
from organization.models.registration_field import RegistrationFieldType
from organization.serializers.registration_field import (
    RegistrationFieldSerializer,
    create_fields,
    sync_fields,
)


def _compute_effective_status(obj: EventRegistrationConfig) -> str:
    """
    Return the effective registration status for API responses.

    Returns ``RegistrationStatus.ENDED`` (``"ended"``) when the stored status
    is OPEN but ``registration_end_date`` has already passed — no DB column
    needed.  All other stored statuses (CLOSED, FULL) are returned unchanged.
    """
    if (
        obj.status == RegistrationStatus.OPEN
        and obj.registration_end_date is not None
        and obj.registration_end_date < timezone.now()
    ):
        return RegistrationStatus.ENDED
    return obj.status


class EventRegistrationConfigBaseSerializer(serializers.ModelSerializer):
    """
    Shared base for EventRegistrationConfig serializers.

    Provides two behaviours used by every read response:

    ``to_representation``
        Replaces the raw stored ``status`` with the computed effective status
        so that ``"ended"`` is returned when the deadline has passed.

    ``available_seats`` / ``get_available_seats``
        Always-computed default: ``max_participants − COUNT(registrations)``,
        or ``None`` for unlimited-capacity events.  Subclasses that serve
        *list* endpoints should override ``get_available_seats`` to gate the
        COUNT query behind a context flag (see ``EventRegistrationConfigSerializer``).
    """

    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = EventRegistrationConfig
        fields = []  # Subclasses declare their own field list.

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["status"] = _compute_effective_status(instance)
        return data

    def get_available_seats(self, obj):
        """Return available seats, or ``None`` for unlimited-capacity events.

        Only active (non-cancelled) registrations count against capacity.
        """
        if obj.max_participants is None:
            return None
        active_count = obj.registrations.filter(cancelled_at__isnull=True).count()
        return max(0, obj.max_participants - active_count)


class EventRegistrationConfigSerializer(EventRegistrationConfigBaseSerializer):
    """
    Serializes EventRegistrationConfig settings for an event project.

    Used for both read (project detail response) and write (create/update).

    On the write path, pass the following context so business rules are enforced:
        - is_event_type (bool): whether the project is of type 'event'
        - is_draft (bool): whether the project will remain a draft after saving
        - event_end_date (datetime | None): the event's end_date for cross-field check
        - existing_er (EventRegistrationConfig | None): current row for PATCH merged-state check

    Type coercion (str→int, str→datetime) and range validation (min_value=1) are
    handled automatically by DRF — no manual int() / parse() calls are needed.

    Status field:
        - Read: returns the *effective* status — ``"ended"`` when the stored status
          is OPEN but ``registration_end_date`` has passed (computed by
          ``_compute_effective_status``; no DB column required).
        - Write: organiser may send 'open' or 'closed' to manually open/close
          registration.  'full' is system-managed and rejected on write.

    available_seats:
        - Only included (non-null) when ``context["include_seat_count"]`` is True.
        - Computed as ``max_participants - COUNT(registrations)`` on the fly.
        - Returns ``None`` when the context flag is absent (list responses) to
          avoid a COUNT query per row on the project list endpoint.
        - Returns ``None`` when ``max_participants`` is None (unlimited capacity).
    """

    class Meta(EventRegistrationConfigBaseSerializer.Meta):
        fields = [
            "max_participants",
            "registration_end_date",
            "status",
            "available_seats",
            "notify_admins",
        ]
        extra_kwargs = {
            # PositiveIntegerField gives us min_value via the model, but we set
            # min_value=1 explicitly so DRF returns a clear field-level error.
            "max_participants": {"required": False, "allow_null": True, "min_value": 1},
            "registration_end_date": {"required": False, "allow_null": True},
            # Organisers may set OPEN or CLOSED; FULL is reserved for the system.
            "status": {"required": False, "default": RegistrationStatus.OPEN},
            # Writable on creation (POST /api/projects/); defaults to True when omitted.
            # Editing after creation is done via PATCH /registration-config/ using
            # EditEventRegistrationConfigSerializer.
            "notify_admins": {"required": False},
        }

    def get_available_seats(self, obj):
        """
        Return the number of seats still available, or None.

        Overrides the base to gate the COUNT query behind ``include_seat_count``
        — prevents an extra COUNT per row on the project list endpoint.
        """
        if not self.context.get("include_seat_count", False):
            return None
        return super().get_available_seats(obj)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not self.context.get("include_seat_count", False):
            # List endpoint: omit organiser-only and heavy nested data.
            data.pop("notify_admins", None)
        else:
            # Detail endpoint: include field definitions so the registrant-side
            # task can render the form without an extra round-trip.
            qs = instance.fields.prefetch_related("options")
            data["fields"] = RegistrationFieldSerializer(
                qs, many=True, context=self.context
            ).data
        return data

    def validate_status(self, value):
        """Prevent organisers from directly setting system-managed statuses."""
        if value in (RegistrationStatus.FULL, RegistrationStatus.ENDED):
            raise serializers.ValidationError(
                "Status can only be set to 'open' or 'closed'. "
                "'full' and 'ended' are system-managed."
            )
        return value

    def to_internal_value(self, data):
        result = super().to_internal_value(data)

        # Handle `fields` separately — it is not a model field and is not
        # declared on the serializer (to avoid shadowing DRF's .fields property).
        if isinstance(data, dict) and "fields" in data:
            field_ser = RegistrationFieldSerializer(
                data=data["fields"],
                many=True,
                context=self.context,
            )
            if not field_ser.is_valid():
                raise serializers.ValidationError({"fields": field_ser.errors})
            result["fields"] = field_ser.validated_data

        return result

    def validate(self, attrs):
        # Read path: serializer instantiated without context — skip write checks.
        if "is_event_type" not in self.context:
            return attrs

        is_event_type = self.context["is_event_type"]
        is_draft = self.context.get("is_draft", True)
        event_end_date = self.context.get("event_end_date")
        existing_er = self.context.get("existing_er")

        if not is_event_type:
            raise serializers.ValidationError(
                "registration_config can only be set for projects of type 'event'."
            )

        # Cross-field check: registration must close before the event ends.
        reg_end = attrs.get("registration_end_date")
        if (
            reg_end is not None
            and event_end_date is not None
            and reg_end > event_end_date
        ):
            raise serializers.ValidationError(
                {
                    "registration_end_date": (
                        "Must be on or before the event's end_date."
                    )
                }
            )

        # Required-field check — only enforced when publishing (not a draft).
        # For PATCH, merge incoming values with the stored row so that fields
        # already saved count towards satisfying the requirement.
        if not is_draft:
            merged_max_p = (
                attrs.get("max_participants")
                if "max_participants" in attrs
                else (existing_er.max_participants if existing_er else None)
            )
            merged_reg_end = (
                attrs.get("registration_end_date")
                if "registration_end_date" in attrs
                else (existing_er.registration_end_date if existing_er else None)
            )
            if merged_max_p is None:
                raise serializers.ValidationError(
                    {"max_participants": "Required when publishing an event."}
                )
            if merged_reg_end is None:
                raise serializers.ValidationError(
                    {"registration_end_date": "Required when publishing an event."}
                )

        # Field count and uniqueness checks.
        if "fields" in attrs:
            fields_data = attrs["fields"]
            if len(fields_data) > 5:
                raise serializers.ValidationError(
                    {"fields": "Maximum 5 custom fields allowed per event."}
                )
            orders = [f.get("order") for f in fields_data if "order" in f]
            if len(orders) != len(set(orders)):
                raise serializers.ValidationError(
                    {"fields": "Field order values must be unique within the event."}
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        fields_data = validated_data.pop("fields", [])
        config = EventRegistrationConfig.objects.create(**validated_data)
        if fields_data:
            create_fields(config, fields_data)
        return config


class EventRegistrationSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for EventRegistration (a user's sign-up record).

    Used by GET /api/projects/{url_slug}/registrations/ to return the full
    guest list (active and cancelled) to event organisers and team admins.

    ``id`` is included so the frontend can target individual registrations for
    admin-cancellation (DELETE /api/projects/{slug}/registrations/{id}/).
    ``cancelled_at`` lets the frontend distinguish active from cancelled rows.

    Requires ``select_related("user__user_profile")`` on the queryset to avoid
    N+1 queries when resolving ``url_slug`` and ``thumbnail_image`` from the
    related ``UserProfile``.

    Pass ``request`` in context to build absolute URLs for ``thumbnail_image``.
    """

    user_first_name = serializers.CharField(source="user.first_name", read_only=True)
    user_last_name = serializers.CharField(source="user.last_name", read_only=True)
    user_url_slug = serializers.SerializerMethodField()
    user_thumbnail_image = serializers.SerializerMethodField()

    class Meta:
        model = EventRegistration
        fields = [
            "id",
            "user_first_name",
            "user_last_name",
            "user_url_slug",
            "user_thumbnail_image",
            "registered_at",
            "cancelled_at",
        ]
        read_only_fields = fields

    def get_user_url_slug(self, obj):
        try:
            return obj.user.user_profile.url_slug
        except AttributeError:
            return None


class RegistrationFieldAnswerInputSerializer(serializers.Serializer):
    """Validates one answer item in POST /registrations/ payload."""

    field = serializers.IntegerField(min_value=1)
    value_boolean = serializers.BooleanField(required=False, allow_null=True)
    value_option = serializers.IntegerField(
        required=False,
        allow_null=True,
        min_value=1,
    )

    def validate(self, attrs):
        has_boolean = (
            "value_boolean" in attrs and attrs.get("value_boolean") is not None
        )
        has_option = "value_option" in attrs and attrs.get("value_option") is not None

        if has_boolean and has_option:
            raise serializers.ValidationError(
                "Provide either value_boolean or value_option, not both."
            )
        if not has_boolean and not has_option:
            raise serializers.ValidationError(
                "Provide one of value_boolean or value_option."
            )
        return attrs


class EventRegistrationSubmissionSerializer(serializers.Serializer):
    """
    Validates the registration submission payload for POST /registrations/.

    Payload shape:
      {"answers": [{"field": <id>, "value_boolean": true}, ...]}
    """

    answers = RegistrationFieldAnswerInputSerializer(many=True, required=False)

    def validate(self, attrs):
        answers = attrs.get("answers", [])
        registration_config = self.context["registration_config"]

        fields = list(registration_config.fields.prefetch_related("options").all())
        fields_by_id = {field.id: field for field in fields}

        if not fields and answers:
            raise serializers.ValidationError(
                {"answers": "This event has no custom registration fields."}
            )

        errors = []
        normalized_answers = []
        seen_fields = set()
        options_by_field_id = {
            field.id: {option.id: option for option in field.options.all()}
            for field in fields
        }

        for item in answers:
            field_id = item["field"]
            answer_error = {}

            field = fields_by_id.get(field_id)
            if field is None:
                answer_error["field"] = "Field does not belong to this event."
                errors.append(answer_error)
                continue

            if field_id in seen_fields:
                answer_error["field"] = "Duplicate answer for this field."
                errors.append(answer_error)
                continue

            seen_fields.add(field_id)

            value_boolean = item.get("value_boolean", None)
            value_option_id = item.get("value_option", None)

            if field.field_type == RegistrationFieldType.CHECKBOX:
                if value_option_id is not None:
                    answer_error[
                        "value_option"
                    ] = "value_option is not allowed for checkbox fields."
                if value_boolean is None:
                    answer_error[
                        "value_boolean"
                    ] = "value_boolean is required for checkbox fields."
                elif field.is_required and value_boolean is not True:
                    answer_error[
                        "value_boolean"
                    ] = "This required checkbox must be checked."

                if answer_error:
                    errors.append(answer_error)
                    continue

                normalized_answers.append(
                    {
                        "field": field,
                        "value_boolean": value_boolean,
                        "value_option": None,
                    }
                )
                continue

            if field.field_type == RegistrationFieldType.OPTION_SELECT:
                if value_boolean is not None:
                    answer_error[
                        "value_boolean"
                    ] = "value_boolean is not allowed for option_select fields."
                if value_option_id is None:
                    answer_error[
                        "value_option"
                    ] = "value_option is required for option_select fields."
                else:
                    option = options_by_field_id[field_id].get(value_option_id)
                    if option is None:
                        answer_error[
                            "value_option"
                        ] = "Selected option does not belong to this field."

                if answer_error:
                    errors.append(answer_error)
                    continue

                normalized_answers.append(
                    {
                        "field": field,
                        "value_boolean": None,
                        "value_option": options_by_field_id[field_id][value_option_id],
                    }
                )
                continue

            errors.append({"field": "Unsupported field type."})

        # Required fields must be present in the payload.
        for field in fields:
            if field.is_required and field.id not in seen_fields:
                errors.append(
                    {
                        "field": field.id,
                        "required": "Missing required answer for this field.",
                    }
                )

        if errors:
            raise serializers.ValidationError({"answers": errors})

        attrs["normalized_answers"] = normalized_answers
        return attrs


def sync_registration_answers(registration, normalized_answers):
    """
    Sync answers for one registration to match the submitted answer list.

    - existing field answer present in payload -> update
    - payload field answer not in DB          -> create
    - DB field answer omitted from payload    -> delete
    """
    existing = {
        answer.field_id: answer
        for answer in registration.field_answers.select_related("value_option").all()
    }
    incoming_field_ids = set()

    create_rows = []
    for item in normalized_answers:
        field = item["field"]
        incoming_field_ids.add(field.id)
        current = existing.get(field.id)

        if current is None:
            create_rows.append(
                RegistrationFieldAnswer(
                    registration=registration,
                    field=field,
                    value_boolean=item["value_boolean"],
                    value_option=item["value_option"],
                )
            )
            continue

        current.value_boolean = item["value_boolean"]
        current.value_option = item["value_option"]
        current.save(update_fields=["value_boolean", "value_option", "updated_at"])

    if create_rows:
        RegistrationFieldAnswer.objects.bulk_create(create_rows)

    to_delete = [
        answer.id
        for field_id, answer in existing.items()
        if field_id not in incoming_field_ids
    ]
    if to_delete:
        RegistrationFieldAnswer.objects.filter(id__in=to_delete).delete()

    def get_user_thumbnail_image(self, obj):
        try:
            profile = obj.user.user_profile
            if not profile.thumbnail_image:
                return None
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(profile.thumbnail_image.url)
            return profile.thumbnail_image.url
        except AttributeError:
            return None


class SendOrganizerEmailSerializer(serializers.Serializer):
    """
    Validates the payload for POST /api/projects/{url_slug}/registrations/email/.

    Fields:
        subject  — plain-text subject line (max 200 chars, required).
        message  — plain-text body (required).
        is_test  — when True, send a single test email to the organiser only;
                   when False (default), bulk-send to all active participants.
    """

    subject = serializers.CharField(max_length=200, allow_blank=False)
    message = serializers.CharField(allow_blank=False)
    is_test = serializers.BooleanField(default=False)


class EditEventRegistrationConfigSerializer(EventRegistrationConfigBaseSerializer):
    """
    Serializer for PATCH /api/projects/{slug}/registration-config/.

    Allows an event organiser to update ``max_participants``,
    ``registration_end_date``, and ``status`` on an existing EventRegistrationConfig.

    ``status`` (writable):
        - Organiser may send ``"open"`` or ``"closed"`` to manually open/close
          registration.
        - ``"full"`` and ``"ended"`` are system-managed and are rejected with a
          ``400 Bad Request``.
        - Attempting to set ``status = "open"`` when the effective status is
          already ``"ended"`` (deadline has passed) raises ``400 Bad Request``
          with a message directing the organiser to extend the deadline first.
        - ``full`` → ``open`` is permitted **only when capacity is still
          available** after this PATCH (i.e. current registration count <
          effective ``max_participants``).  If the event is still at or over
          capacity the request is rejected with ``400 Bad Request``.
        - Auto-adjustment logic (see below) is skipped when ``status`` is
          explicitly present in the request body — the organiser's intent wins.

    ``available_seats`` is always computed and included in the response (no
    context flag required — this serializer is used exclusively on the detail
    endpoint).

    Required context:
        project (Project): the related project instance.

    Validation:
        - ``registration_end_date`` must be > now()  (past-date guard, edit only)
        - ``registration_end_date`` must be ≤ ``project.end_date``
        - ``max_participants`` must be ≥ current registration count (lower-bound guard)
        - ``status = "open"`` is rejected when ``effective_status == "ended"``
        - ``status = "open"`` is rejected when registration count ≥ effective
          ``max_participants`` (fully-booked guard; use effective value from
          this PATCH if ``max_participants`` is also being changed)

    Automatic status adjustment (applied only when ``max_participants`` is in the
    request body AND ``status`` is NOT explicitly provided):
        - FULL → OPEN  when new capacity > current registration count
        - FULL → OPEN  when new capacity is set to ``null`` (unlimited)
        - OPEN → FULL  when new capacity == current registration count
    """

    class Meta(EventRegistrationConfigBaseSerializer.Meta):
        fields = [
            "max_participants",
            "registration_end_date",
            "status",
            "available_seats",
            "notify_admins",
        ]
        extra_kwargs = {
            "max_participants": {"required": False, "allow_null": True, "min_value": 1},
            "registration_end_date": {"required": False, "allow_null": True},
            "status": {"required": False},
            "notify_admins": {"required": False},
        }

    def validate_status(self, value):
        """Reject system-managed statuses (FULL and ENDED) on write."""
        if value in (RegistrationStatus.FULL, RegistrationStatus.ENDED):
            raise serializers.ValidationError(
                "Status can only be set to 'open' or 'closed'. "
                "'full' and 'ended' are system-managed."
            )
        return value

    def to_internal_value(self, data):
        result = super().to_internal_value(data)

        # Handle `fields` separately — not a model field and not declared on
        # the serializer to avoid shadowing DRF's .fields property.
        if isinstance(data, dict) and "fields" in data:
            is_draft = self.context.get("is_draft", False)
            field_ser = RegistrationFieldSerializer(
                data=data["fields"],
                many=True,
                context={**self.context, "is_draft": is_draft},
            )
            if not field_ser.is_valid():
                raise serializers.ValidationError({"fields": field_ser.errors})
            result["fields"] = field_ser.validated_data

        return result

    def to_representation(self, instance):
        data = super().to_representation(instance)
        qs = instance.fields.prefetch_related("options")
        data["fields"] = RegistrationFieldSerializer(
            qs, many=True, context=self.context
        ).data
        return data

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Save updated config fields, sync custom registration fields, and
        auto-adjust status when max_participants changes.

        Auto-adjustment is skipped when ``status`` is explicitly present in the
        request body — the organiser's explicit intent takes priority over the
        capacity-driven heuristic.
        """
        fields_data = validated_data.pop("fields", None)

        explicit_status = validated_data.get("status")

        if "max_participants" in validated_data and explicit_status is None:
            new_max = validated_data["max_participants"]
            if new_max is None:
                # Switching to unlimited capacity — always re-opens a full event.
                if instance.status == RegistrationStatus.FULL:
                    instance.status = RegistrationStatus.OPEN
            else:
                current_count = EventRegistration.objects.filter(
                    registration_config=instance,
                    cancelled_at__isnull=True,
                ).count()
                if (
                    instance.status == RegistrationStatus.FULL
                    and new_max > current_count
                ):
                    # Capacity raised above filled seats → re-open.
                    instance.status = RegistrationStatus.OPEN
                elif (
                    instance.status == RegistrationStatus.OPEN
                    and new_max <= current_count
                ):
                    # Capacity set to match filled seats (< is blocked by validate) → close.
                    instance.status = RegistrationStatus.FULL
        result = super().update(instance, validated_data)

        if fields_data is not None:
            sync_fields(instance, fields_data)

        return result

    def validate(self, attrs):
        project = self.context.get("project") or (
            self.instance.project if self.instance else None
        )

        registration_end_date = attrs.get("registration_end_date")
        if registration_end_date is not None:
            if registration_end_date <= timezone.now():
                raise serializers.ValidationError(
                    {
                        "registration_end_date": (
                            "Registration end date cannot be in the past."
                        )
                    }
                )
            if (
                project
                and project.end_date
                and registration_end_date > project.end_date
            ):
                raise serializers.ValidationError(
                    {
                        "registration_end_date": (
                            "Registration end date must be on or before the event end date."
                        )
                    }
                )

        # Lazily computed and shared by multiple guards below to avoid extra queries.
        registration_count = None

        max_participants = attrs.get("max_participants")
        if max_participants is not None and self.instance:
            registration_count = EventRegistration.objects.filter(
                registration_config=self.instance,
                cancelled_at__isnull=True,
            ).count()
            if max_participants < registration_count:
                raise serializers.ValidationError(
                    {
                        "max_participants": (
                            f"Cannot be lower than the current number of "
                            f"registrations ({registration_count})."
                        )
                    }
                )

        # Guard: organiser may not reopen a registration whose deadline has passed.
        # They must extend ``registration_end_date`` first, then reopen.
        new_status = attrs.get("status")
        if new_status == RegistrationStatus.OPEN and self.instance:
            effective = _compute_effective_status(self.instance)
            if effective == RegistrationStatus.ENDED:
                raise serializers.ValidationError(
                    {
                        "status": (
                            "Cannot reopen: registration deadline has passed. "
                            "Please extend the registration end date first."
                        )
                    }
                )

            # Guard: cannot reopen when the event is at or over capacity.
            # Use the new max_participants if it is being updated in this PATCH,
            # otherwise fall back to the currently stored value.
            effective_max = attrs.get(
                "max_participants", self.instance.max_participants
            )
            if effective_max is not None:
                if registration_count is None:
                    registration_count = EventRegistration.objects.filter(
                        registration_config=self.instance,
                        cancelled_at__isnull=True,
                    ).count()
                if registration_count >= effective_max:
                    raise serializers.ValidationError(
                        {
                            "status": (
                                "Cannot reopen: the event is fully booked. "
                                "Please increase the maximum participants first."
                            )
                        }
                    )

        # Field count, uniqueness, and ID existence checks.
        if "fields" in attrs:
            fields_data = attrs["fields"]
            if len(fields_data) > 5:
                raise serializers.ValidationError(
                    {"fields": "Maximum 5 custom fields allowed per event."}
                )
            orders = [f.get("order") for f in fields_data if "order" in f]
            if len(orders) != len(set(orders)):
                raise serializers.ValidationError(
                    {"fields": "Field order values must be unique within the event."}
                )
            # Verify that all provided field IDs actually belong to this config.
            submitted_ids = [f["id"] for f in fields_data if f.get("id") is not None]
            if submitted_ids and self.instance:
                existing_ids = set(
                    self.instance.fields.filter(id__in=submitted_ids).values_list(
                        "id", flat=True
                    )
                )
                unknown = set(submitted_ids) - existing_ids
                if unknown:
                    raise serializers.ValidationError(
                        {
                            "fields": f"Field IDs not found on this event: {sorted(unknown)}"
                        }
                    )

        return attrs
