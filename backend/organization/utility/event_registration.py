from typing import Union

from django.db.models import Sum

from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationStatus,
)
from organization.models.registration_field import (
    RegistrationFieldType,
)


def _is_option_sold_out(field, option):
    """Return True if a single option has zero remaining capacity."""
    if option.available_amount is None:
        return False

    active_answers = option.answers.filter(
        registration__cancelled_at__isnull=True,
    )
    if field.field_type == RegistrationFieldType.INVENTORY:
        booked = active_answers.aggregate(booked=Sum("value_number"))["booked"] or 0
    else:
        booked = active_answers.count()

    return option.available_amount - booked <= 0


def _are_required_fields_sold_out(rc: EventRegistrationConfig) -> bool:
    """True if ALL required fields in at least one capacity-limited type group
    (inventory OR time slot) are fully sold out.

    A required field is sold out when every one of its options has zero
    remaining capacity.  Fields with no options or with unlimited options
    (available_amount=None) are never sold out.

    The check is an OR across field-type groups: if every required inventory
    field is sold out, the event is sold out regardless of time-slot
    availability, and vice-versa.  This is because a guest must fill in every
    required field — if any single required field has no available options,
    registration is impossible.

    Short-circuits: returns True as soon as one entire type group is sold out.
    """
    required_fields = rc.fields.filter(
        field_type__in=[
            RegistrationFieldType.INVENTORY,
            RegistrationFieldType.TIME_SLOT_SELECT,
        ],
        is_required=True,
    ).prefetch_related("options")

    if not required_fields.exists():
        return False

    fields_by_type: dict[str, list] = {}
    for field in required_fields:
        fields_by_type.setdefault(field.field_type, []).append(field)

    for _field_type, fields in fields_by_type.items():
        group_sold_out = True
        for field in fields:
            options = field.options.all()
            if not options.exists():
                group_sold_out = False
                break

            for option in options:
                if not _is_option_sold_out(field, option):
                    group_sold_out = False
                    break

            if not group_sold_out:
                break

        if group_sold_out:
            return True

    return False


def evaluate_registration_status(
    rc: EventRegistrationConfig,
) -> Union[RegistrationStatus, str]:
    """Return the registration status the event should have right now.

    Considers max_participants, required-inventory availability, and
    required time-slot availability.

    Returns RegistrationStatus.FULL or RegistrationStatus.OPEN.

    Does NOT consider CLOSED or ENDED — those are set by other mechanisms
    (manual close, deadline) and are preserved by the caller.

    The caller is responsible for gating on auto-managed statuses: only
    apply the result when the current status is OPEN or FULL.
    """
    max_participants_full = False
    if rc.max_participants is not None:
        active_count = EventRegistration.objects.filter(
            registration_config=rc,
            cancelled_at__isnull=True,
        ).count()
        if active_count >= rc.max_participants:
            max_participants_full = True

    if max_participants_full:
        return RegistrationStatus.FULL

    if _are_required_fields_sold_out(rc):
        return RegistrationStatus.FULL

    return RegistrationStatus.OPEN
