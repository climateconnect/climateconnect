from typing import Any, cast
import datetime

from django.core.management.base import BaseCommand

from climateconnect_api.models.badge import DonorBadge


class Command(BaseCommand):
    help = "Create badges data for users"

    def handle(self, *args: Any, **options: Any) -> None:
        donor_badges: list[dict[str, Any]] = [
            {
                "min_duration_in_days": 0,
                "image": "../frontend/images/donor_badges/badge_1.svg",
                "name": "New Supporter",
                "name_de": "Neue*r Unterstützer*in",
            },
            {
                "min_duration_in_days": 30,
                "image": "../frontend/images/donor_badges/badge_2.svg",
                "name": "1 Month Supporter",
                "name_de": "Unterstützt seit 1 Monat",
            },
            {
                "min_duration_in_days": 90,
                "image": "../frontend/images/donor_badges/badge_3.svg",
                "name": "3 Month Supporter",
                "name_de": "Unterstützt seit 3 Monaten",
            },
            {
                "min_duration_in_days": 180,
                "image": "../frontend/images/donor_badges/badge_4.svg",
                "name": "Half-Year Supporter",
                "name_de": "Unterstützt seit einem halben Jahr",
            },
            {
                "min_duration_in_days": 365,
                "image": "../frontend/images/donor_badges/badge_5.svg",
                "name": "1 Year Supporter",
                "name_de": "Unterstützt seit einem Jahr",
            },
            {
                "min_duration_in_days": 730,
                "image": "../frontend/images/donor_badges/badge_6.svg",
                "name": "2 Year Supporter",
                "name_de": "Unterstützt seit 2 Jahren",
            },
        ]

        for badge in donor_badges:
            existing_badge = DonorBadge.objects.filter(
                regular_donor_minimum_duration=datetime.timedelta(
                    days=badge["min_duration_in_days"]
                )
            )
            if existing_badge.exists():
                print(
                    "Badge for min duration {} days already existed. Skipping badge {}".format(
                        badge["min_duration_in_days"], badge["name"]
                    )
                )
            else:
                DonorBadge.objects.get_or_create(
                    name=badge["name"],
                    name_de=badge["name_de"],
                    image=badge["image"],
                    regular_donor_minimum_duration=datetime.timedelta(
                        days=cast(float, badge["min_duration_in_days"])
                    ),
                    is_active=False,
                )
                print(
                    "Inserted badge {}. Please set is_active to True in django admin to activate it.".format(
                        badge["name"]
                    )
                )
