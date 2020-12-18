from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.models import UserProfile
from climateconnect_api.utility.location import get_geo_location


class Command(BaseCommand):
    help = "Convert organization city, state and country to location column."

    def handle(self, *args: Any, **options: Any) -> None:
        print("Total user profiles: {}".format(UserProfile.objects.count()))
        profile_counter = 0

        for profile in UserProfile.objects.all():
            print("Updating user profile {}'s location".format(profile.id))
            current_location = []
            if profile.state:
                current_location.append(profile.state)
            if profile.country:
                current_location.append(profile.country)
            
            if current_location:
                geo_location = get_geo_location(",".format(current_location))
                if geo_location:
                    profile.location = geo_location['location']
                    profile.latitude = geo_location['latitude']
                    profile.longitude = geo_location['longitude']
                    profile_counter += 1
                    profile.save()
                else:
                    print("Geo location not found for user profile {}".format(profile.id))
            else:
                print("Location not found for user profile {}".format(profile.id))
        
        print("Total user profiles updated: {}".format(profile_counter))
