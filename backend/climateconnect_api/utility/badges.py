from climateconnect_api.models.badge import Badge, DonorBadge
from climateconnect_api.models.donation import Donation
import datetime


def get_badges(user_profile):
    donations = Donation.objects.filter(user=user_profile.user)
    badges = []
    if donations.exists():
        today = datetime.datetime.now()
        d = get_highest_impact_donation(donations)
        if d:
            time_donated = today - d.date_first_received.replace(tzinfo=None)
            badge = DonorBadge.objects.filter(
                regular_donor_minimum_duration__lte=time_donated,
                is_active=True
            ).order_by(
                "-regular_donor_minimum_duration"
            )[0]
            badges.append(badge)

    return badges


def get_highest_impact_donation(donations):
    today = datetime.date.today()
    one_month_ago = today - datetime.timedelta(days=30)
    active_recurring_donations = donations.filter(
        is_recurring=True, donation_amount__gte=5
    ).exclude(
        date_cancelled__lte=one_month_ago
    ).order_by(
        'date_first_received'
    )
    longest_recurring_donation = None
    if active_recurring_donations.exists():
        longest_recurring_donation = active_recurring_donations[0]

    return longest_recurring_donation


def get_badge_name(badge: Badge, language_code: str):
    lang_translation_attr = "name_{}".format(language_code)
    if hasattr(badge, lang_translation_attr):
        translation = getattr(badge, lang_translation_attr)
        if language_code != "en" and translation is not None:
            return translation
    return badge.name
