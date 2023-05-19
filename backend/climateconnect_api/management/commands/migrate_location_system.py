from django.contrib.gis.geos.point import Point
from location.utility import get_global_location, get_multipolygon_from_geojson
from location.utility import format_location, get_location
from typing import Any
from django.conf import settings
from django.core.management.base import BaseCommand
import requests

from climateconnect_api.models import UserProfile
from organization.models import Organization, Project

from location.models import Location

import json


class Command(BaseCommand):
    help = "Convert organization city, state and country to location column."

    def handle(self, *args: Any, **options: Any) -> None:
        get_global_location()
        unknown_location = get_unknown_location()
        num_user_profiles = UserProfile.objects.filter(
            location__is_formatted=False
        ).count()
        user_profiles = UserProfile.objects.filter(location__is_formatted=False)
        migrate_table(
            "profiles", num_user_profiles, user_profiles, "location", unknown_location
        )
        num_organizations = Organization.objects.filter(
            location__is_formatted=False
        ).count()
        organizations = Organization.objects.filter(location__is_formatted=False)
        migrate_table(
            "organizations",
            num_organizations,
            organizations,
            "location",
            unknown_location,
        )
        num_projects = Project.objects.filter(loc__is_formatted=False).count()
        projects = Project.objects.filter(loc__is_formatted=False)
        migrate_table("projects", num_projects, projects, "loc", unknown_location)


def migrate_table(name, num_elements, elements, location_key, unknown_location):
    print(
        "Total {name} to migrate to new location system: {number}".format(
            name=name, number=num_elements
        )
    )
    counter = 0
    for element in elements:
        print("City:" + str(element.city) + " country:" + str(element.country))
        locations = Location.objects.filter(city=element.city, country=element.country)
        if locations.exists() and locations[0].is_formatted is True:
            print("it exists and is formatted!")
            setattr(element, location_key, locations[0])
            element.save()
        elif element.city is None or element.country is None:
            setattr(element, location_key, unknown_location)
            print(
                "no city and country. assigning unknown location to element "
                + str(element.url_slug)
            )
            element.save()
        else:
            url_root = settings.LOCATION_SERVICE_BASE_URL + "/search?q="
            url_ending = "&format=json&addressdetails=1&polygon_geojson=1&polygon_threshold=0.01&accept-language=en-US,en;q=0.9"
            query = element.city + ", " + element.country
            url = url_root + query + url_ending
            response = requests.get(url)
            location_results = get_location_results(response.text)
            if len(location_results) == 0:
                setattr(element, location_key, unknown_location)
                print("assigning unknown location for user " + element.url_slug)
                element.save()
            else:
                location_object = location_results[0]
                location = get_location(location_object)
                if location.is_formatted is False:
                    print(location)
                    print("formatting location " + location_object["name"])
                    if not location_object["type"] == "Point":
                        multipolygon = get_multipolygon_from_geojson(
                            location_object["geojson"]
                        )
                        location.multi_polygon = multipolygon
                    location.city = location_object["city"]
                    location.country = location_object["country"]
                    location.state = location_object["state"]
                    location.name = location_object["name"]
                    location.is_formatted = True
                    location.centre_point = Point(
                        float(location_object["lat"]), float(location_object["lon"])
                    )
                    location.save()
                print(
                    "assigning location:"
                    + location_object["name"]
                    + " for user "
                    + element.url_slug
                )
                setattr(element, location_key, location)
                element.save()
        counter = counter + 1
        print(
            "{counter}/{total} {name} updated ({percentage}%)".format(
                counter=counter,
                total=num_elements,
                name=name,
                percentage=int((counter / num_elements) * 100),
            )
        )
    print("Total {name} updated: {counter}".format(name=name, counter=counter))


def get_location_results(res):
    banned_classes = [
        "landuse",
        "tourism",
        "railway",
        "waterway",
        "natural",
        "shop",
        "leisure",
        "amenity",
        "highway",
        "aeroway",
        "historic",
    ]

    banned_types = ["claimed_administrative", "isolated_dwelling", "croft"]

    raw_location_results = json.loads(res)
    location_results = []
    for loc in raw_location_results:
        if (
            loc["importance"] > 0.5
            and loc["class"] not in banned_classes
            and loc["type"] not in banned_types
        ):
            location_results.append(format_location(loc, True))
    return location_results


def get_unknown_location():
    unknown_location = Location.objects.filter(name="Unknown")
    if unknown_location.exists():
        return unknown_location[0]
    else:
        unknown_location = Location.objects.create(
            name="Unknown",
            city="unknown",
            country="unknown",
            place_id=2,
            is_formatted=True,
        )
        return unknown_location
