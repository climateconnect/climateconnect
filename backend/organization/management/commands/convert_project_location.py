# type: ignore
from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.utility.location import get_geo_location
from organization.models.project import Project


class Command(BaseCommand):
    def handle(self, *args: Any, **options: Any) -> None:
        print("Total projects: {}".format(Project.objects.count()))
        project_counter = 0

        for project in Project.objects.all():
            print("Updating project {}'s location".format(project.id))
            current_location = []
            if project.city:
                current_location.append(project.city)
            if project.country:
                current_location.append(project.country)

            if current_location:
                geo_location = get_geo_location(",".join(current_location))
                if geo_location:
                    project.location = geo_location["location"]
                    project.latitude = geo_location["latitude"]
                    project.longitude = geo_location["longitude"]
                    project_counter += 1
                    project.save()
                else:
                    print("Geo location not found for project {}".format(project.id))
            else:
                print("Location not found for project {}".format(project.id))

        print("Total projects updated: {}".format(project_counter))
