from climateconnect_api.models.badge import DonorBadge, UserBadge
from climateconnect_api.models.donation import Donation
import datetime
from django.db.models import Q


def get_badges(user_profile):
    badges = []

    prefetched_cache_exists = hasattr(user_profile, "user") and hasattr(
        user_profile.user, "_prefetched_objects_cache"
    )

    # Get all donations, but only if they have not been prefetched / cached:
    if (
        prefetched_cache_exists
        and "donation_user" in user_profile.user._prefetched_objects_cache
    ):
        all_donations = user_profile.user.donation_user.all()
    else:
        all_donations = Donation.objects.filter(user=user_profile.user)

    # Get all badges, but only if they have not been prefetched / cached:
    if (
        prefetched_cache_exists
        and "userbadge_user" in user_profile.user._prefetched_objects_cache
    ):
        user_badges = user_profile.user.userbadge_user.all()
    else:
        user_badges = UserBadge.objects.filter(user=user_profile.user).all()

    if user_badges:
        for badge in user_badges:
            badges.append(badge.badge)

    if all_donations:
        d = get_oldest_relevant_donation(all_donations)
        if d:
            today = datetime.datetime.today()
            time_donated = time_donated = today - d.date_first_received.replace(
                tzinfo=None
            )
            # TODO: update this filter logic to be performed by python instead
            # of the database, as it is not efficient to filter at this stage (might be performed
            # during serialization)
            highest_donations_in_streak = all_donations.filter(
                date_first_received__gte=d.date_first_received
            ).order_by("donation_amount")
            highest_donation_in_streak = highest_donations_in_streak[0]
            badges_for_which_user_qualifies = DonorBadge.objects.filter(
                (
                    Q(regular_donor_minimum_duration__lte=time_donated)
                    | Q(
                        instantly_awarded_over_amount__lte=highest_donation_in_streak.donation_amount
                    )
                ),
                is_active=True,
            ).order_by("-regular_donor_minimum_duration")
            # Return the best badge the user qualifies for
            if badges_for_which_user_qualifies.exists():
                badges.append(badges_for_which_user_qualifies[0])

    return badges


def get_relevant_donations(donations):
    today = datetime.date.today()
    one_month_ago = today - datetime.timedelta(days=30)
    return (
        donations.filter(
            Q(donation_amount__gte=5),
            Q(is_recurring=True) | Q(date_first_received__gte=one_month_ago),
        )
        .exclude(date_cancelled__lte=one_month_ago)
        .order_by("date_first_received")
    )


# Badges are awarded on the time that a donor has donated each month to Climate Connect.
# The total duration could be made up of both single donations and recurring donations.
# We're trying to find the time since when the donor has not gone 30 days or more without donating.
def get_oldest_relevant_donation(donations):
    donations_from_last_month = get_relevant_donations(donations)
    if not donations_from_last_month.exists():
        return None
    return get_earliest_donation(donations, donations_from_last_month[0])


def get_earliest_donation(donations, current_earliest):
    earliest_received_date = current_earliest.date_first_received
    one_month_before_earliest = earliest_received_date - datetime.timedelta(days=30)
    earlier_donations = donations.filter(
        Q(date_first_received__lt=earliest_received_date),
        (
            Q(date_first_received__gte=one_month_before_earliest)
            | Q(date_cancelled__gte=one_month_before_earliest)
        ),
    ).order_by("date_first_received")
    if earlier_donations.exists():
        return get_earliest_donation(donations, earlier_donations[0])
    else:
        return current_earliest
