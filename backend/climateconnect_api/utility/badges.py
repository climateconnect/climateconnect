from functools import lru_cache
from time import time
from climateconnect_api.models.badge import DonorBadge, UserBadge
from climateconnect_api.models.donation import Donation
import datetime
from typing import List

MIN_DONATION_AMOUNT = 5
STREAK_GRACE_DAYS = 30  # days


def get_badges(user_profile):
    # prepare the querysets, by checking, if there was a prefetch, otherwise prepare new querysets
    user = user_profile.user
    donation_qs = getattr(user, "donation_user", None)
    badges_qs = getattr(user, "userbadge_user", None)

    if donation_qs is None:
        donation_qs = Donation.objects.filter(user=user)
    if badges_qs is None:
        badges_qs = UserBadge.objects.filter(user=user)

    badges = []

    # uses prefetched if existant
    all_donations = list(donation_qs.all())
    user_badges = list(badges_qs.all())

    if user_badges and len(user_badges) > 0:
        for badge in user_badges:
            badges.append(badge.badge)

    if all_donations and len(all_donations) > 0:
        donations = __extract_valid_donations(all_donations)
        donations_in_streak = __extract_donations_in_streak(donations)

        if len(donations_in_streak) > 0:
            max_donation = max([d.donation_amount for d in donations_in_streak])

            donation_streak_duration = datetime.datetime.today() - min(
                [d.date_first_received for d in donations_in_streak]
            ).replace(tzinfo=None)

            # check donor badges
            donor_badge = __pick_donor_badge(donation_streak_duration, max_donation)
            if donor_badge:
                badges.append(donor_badge)

    return badges


def get_oldest_relevant_donation(donations: List[Donation]) -> Donation | None:
    valid_donations = __extract_valid_donations(donations)
    donations_in_streak = __extract_donations_in_streak(valid_donations)

    # find the oldest donation in the streak
    if len(donations_in_streak) > 0:
        return min(donations_in_streak, key=lambda d: d.date_first_received)
    return None


def __extract_valid_donations(donations: List[Donation]) -> List[Donation]:
    return [d for d in donations if d.donation_amount >= MIN_DONATION_AMOUNT]


def __extract_donations_in_streak(donations: List[Donation]) -> List[Donation]:
    if not donations or len(donations) == 0:
        return []
    today = datetime.date.today()

    # key function for sorting donations by their last active time
    # donations are either single or recurring (30 day recurring)
    # descending order for youngest first
    sorted_donations = sorted(donations, key=__last_donation_time, reverse=True)

    # iterate backwards to find the oldest donation adhering to the streak rules
    current_timestamp = today
    donations_in_streak = []

    for curr in sorted_donations:
        # determine, if the donation adheres to the streak rules
        last_time = __last_donation_time(curr)
        if (current_timestamp - last_time).days <= STREAK_GRACE_DAYS:
            donations_in_streak.append(curr)
            current_timestamp = curr.date_first_received
        # else: skip the donation, as it breaks the streak

    return donations_in_streak


def __last_donation_time(donation: Donation) -> datetime.date:
    if donation.is_recurring and donation.date_cancelled is None:
        return datetime.date.today()
    elif donation.is_recurring and donation.date_cancelled is not None:
        date_time = donation.date_cancelled
        if isinstance(date_time, datetime.datetime):
            date_time = date_time.date()
        return date_time
    else:
        date_time = donation.date_cancelled
        if isinstance(date_time, datetime.datetime):
            date_time = date_time.date()
        return date_time


def __pick_donor_badge(donation_streak_duration, max_amount):
    for donor_badge in __get_active_donor_badges(__current_ttl_hash()):
        if (
            donor_badge.regular_donor_minimum_duration is not None
            and donor_badge.regular_donor_minimum_duration <= donation_streak_duration
        ) or (
            donor_badge.instantly_awarded_over_amount is not None
            and donor_badge.instantly_awarded_over_amount <= max_amount
        ):
            return donor_badge
    return None


# This is a bit hacky:
#
# To avoid hitting the database via a N+1 to query the DonorBadges (e.g. during serialization of
# UserProfiles of Users, which triggers serialization of UserProfiles and UserBadges)
# we cache the active DonorBadges here.
# Cachesize is 1, so only the latest query is cached.
# To invalidate the cache, a hash parameter base on the current timestamp and ttl is used.
# for example, with __current_ttl_hash, the cache is invalidated once per minute.
@lru_cache(maxsize=1)
def __get_active_donor_badges(ttl_hash=None):
    ttl_hash = ttl_hash  # to avoid linter warning

    return list(
        DonorBadge.objects.filter(is_active=True)
        .only("id", "regular_donor_minimum_duration", "instantly_awarded_over_amount")
        .order_by(
            "-regular_donor_minimum_duration",
            "-instantly_awarded_over_amount",
            "-id",
        )
    )


def __current_ttl_hash() -> int:
    # Changes once per minute
    return int(time() // 60)
