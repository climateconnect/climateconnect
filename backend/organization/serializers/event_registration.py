from rest_framework import serializers

from organization.models.event_registration import EventRegistration, RegistrationStatus


class EventRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializes EventRegistration settings for an event project.

    Used for both read (project detail response) and write (create/update).

    On the write path, pass the following context so business rules are enforced:
        - is_event_type (bool): whether the project is of type 'event'
        - is_draft (bool): whether the project will remain a draft after saving
        - event_end_date (datetime | None): the event's end_date for cross-field check
        - existing_er (EventRegistration | None): current row for PATCH merged-state check

    Type coercion (str→int, str→datetime) and range validation (min_value=1) are
    handled automatically by DRF — no manual int() / parse() calls are needed.

    Status field:
        - Read: always returned (defaults to 'open').
        - Write: organiser may send 'open' or 'closed' to manually open/close
          registration.  'full' is system-managed and rejected on write.
    """

    class Meta:
        model = EventRegistration
        fields = ["max_participants", "registration_end_date", "status"]
        extra_kwargs = {
            # PositiveIntegerField gives us min_value via the model, but we set
            # min_value=1 explicitly so DRF returns a clear field-level error.
            "max_participants": {"required": False, "allow_null": True, "min_value": 1},
            "registration_end_date": {"required": False, "allow_null": True},
            # Organisers may set OPEN or CLOSED; FULL is reserved for the system.
            "status": {"required": False, "default": RegistrationStatus.OPEN},
        }

    def validate_status(self, value):
        """Prevent organisers from directly setting status to FULL."""
        if value == RegistrationStatus.FULL:
            raise serializers.ValidationError(
                "'full' is a system-managed status and cannot be set directly. "
                "Use 'open' or 'closed'."
            )
        return value

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
                "event_registration can only be set for projects of type 'event'."
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

        return attrs
