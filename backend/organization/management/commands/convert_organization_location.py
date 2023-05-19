# type: ignore
from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.utility.location import get_geo_location
from organization.models import Organization


class Command(BaseCommand):
    help = "Convert organization city, state and country to location column."

    def handle(self, *args: Any, **options: Any) -> None:
        print("Total organization: {}".format(Organization.objects.count()))
        org_counter = 0
        for organization in Organization.objects.all():
            print("Updating organization {}'s location".format(organization.id))
            current_location = []
            if organization.city:
                current_location.append(organization.city)
            if organization.state:
                current_location.append(organization.state)
            if organization.country:
                current_location.append(organization.country)

            if current_location:
                geo_location = get_geo_location(",".join(current_location))
                if geo_location:
                    organization.location = geo_location["location"]
                    organization.latitude = geo_location["latitude"]
                    organization.longitude = geo_location["longitude"]
                    organization.save()
                    org_counter += 1
                else:
                    print(
                        "Geo location not found for organization {}".format(
                            organization.id
                        )
                    )
            else:
                print("Location not found for organization {}".format(organization.id))

        print("Total organization updated: {}".format(org_counter))
