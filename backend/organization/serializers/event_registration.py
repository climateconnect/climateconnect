from django.utils import timezone
from rest_framework import serializers

from organization.models.event_registration import (
    EventParticipant,
    EventRegistration,
    RegistrationStatus,
)


def _compute_effective_status(obj: EventRegistration) -> str:
    """
    Return the effective registration status for API responses.

    Returns ``"ended"`` when the stored status is OPEN but
    ``registration_end_date`` has already passed — no DB column needed.
    All other stored statuses (CLOSED, FULL) are returned unchanged.
    """
    if (
        obj.status == RegistrationStatus.OPEN
        and obj.registration_end_date is not None
        and obj.registration_end_date < timezone.now()
    ):
        return "ended"
    return obj.status


class EventRegistrationBaseSerializer(serializers.ModelSerializer):
    """
    Shared base for EventRegistration serializers.

    Provides two behaviours used by every read response:

    ``to_representation``
        Replaces the raw stored ``status`` with the computed effective status
        so that ``"ended"`` is returned when the deadline has passed.

    ``available_seats`` / ``get_available_seats``
        Always-computed default: ``max_participants − COUNT(participants)``,
        or ``None`` for unlimited-capacity events.  Subclasses that serve
        *list* endpoints should override ``get_available_seats`` to gate the
        COUNT query behind a context flag (see ``EventRegistrationSerializer``).
    """

    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = EventRegistration
        fields = []  # Subclasses declare their own field list.

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["status"] = _compute_effective_status(instance)
        return data

    def get_available_seats(self, obj):
        """Return available seats, or ``None`` for unlimited-capacity events."""
        if obj.max_participants is None:
            return None
        return max(0, obj.max_participants - obj.participants.count())


class EventRegistrationSerializer(EventRegistrationBaseSerializer):
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
        - Read: returns the *effective* status — ``"ended"`` when the stored status
          is OPEN but ``registration_end_date`` has passed (computed by
          ``_compute_effective_status``; no DB column required).
        - Write: organiser may send 'open' or 'closed' to manually open/close
          registration.  'full' is system-managed and rejected on write.

    available_seats:
        - Only included (non-null) when ``context["include_seat_count"]`` is True.
        - Computed as ``max_participants - COUNT(participants)`` on the fly.
        - Returns ``None`` when the context flag is absent (list responses) to
          avoid a COUNT query per row on the project list endpoint.
        - Returns ``None`` when ``max_participants`` is None (unlimited capacity).
    """

    class Meta(EventRegistrationBaseSerializer.Meta):
        fields = [
            "max_participants",
            "registration_end_date",
            "status",
            "available_seats",
        ]
        extra_kwargs = {
            # PositiveIntegerField gives us min_value via the model, but we set
            # min_value=1 explicitly so DRF returns a clear field-level error.
            "max_participants": {"required": False, "allow_null": True, "min_value": 1},
            "registration_end_date": {"required": False, "allow_null": True},
            # Organisers may set OPEN or CLOSED; FULL is reserved for the system.
            "status": {"required": False, "default": RegistrationStatus.OPEN},
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


class EditEventRegistrationSerializer(EventRegistrationBaseSerializer):
    """
    Serializer for PATCH /api/projects/{slug}/registration/.

    Allows an event organiser to update only ``max_participants`` and
    ``registration_end_date`` on an existing EventRegistration record.
    ``status`` is always read-only via this endpoint — it is managed exclusively
    by the close/reopen action (issue #1851) — **except** for the automatic
    capacity-driven adjustments described below.

    ``available_seats`` is always computed and included in the response (no context
    flag required — this serializer is used exclusively on the detail endpoint).

    Required context:
        project (Project): the related project instance.

    Validation:
        - ``registration_end_date`` must be > now()  (past-date guard, edit only)
        - ``registration_end_date`` must be ≤ ``project.end_date``
        - ``max_participants`` must be ≥ current participant count (lower-bound guard)

    Automatic status adjustment (applied only when ``max_participants`` is in the
    request body):
        - FULL → OPEN  when new capacity > current participant count (organiser
          raised capacity above the filled seats)
        - FULL → OPEN  when new capacity is set to ``null`` (unlimited)
        - OPEN → FULL  when new capacity == current participant count (organiser
          lowered capacity to exactly match filled seats; note: going *below* the
          count is rejected by validation, so equality is the only reachable case)
    """

    class Meta(EventRegistrationBaseSerializer.Meta):
        fields = ["max_participants", "registration_end_date", "status", "available_seats"]
        read_only_fields = ["status"]
        extra_kwargs = {
            "max_participants": {"required": False, "allow_null": True, "min_value": 1},
            "registration_end_date": {"required": False, "allow_null": True},
        }


    def update(self, instance, validated_data):
        """
        Save updated fields and auto-adjust status when max_participants changes.

        Status auto-adjustment is only triggered when ``max_participants`` is
        explicitly present in the request body (i.e., in ``validated_data``).
        """
        if "max_participants" in validated_data:
            new_max = validated_data["max_participants"]
            if new_max is None:
                # Switching to unlimited capacity — always re-opens a full event.
                if instance.status == RegistrationStatus.FULL:
                    instance.status = RegistrationStatus.OPEN
            else:
                current_count = EventParticipant.objects.filter(
                    event_registration=instance
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
        return super().update(instance, validated_data)

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

        max_participants = attrs.get("max_participants")
        if max_participants is not None and self.instance:
            participant_count = EventParticipant.objects.filter(
                event_registration=self.instance
            ).count()
            if max_participants < participant_count:
                raise serializers.ValidationError(
                    {
                        "max_participants": (
                            f"Cannot be lower than the current number of "
                            f"registrations ({participant_count})."
                        )
                    }
                )

        return attrs
