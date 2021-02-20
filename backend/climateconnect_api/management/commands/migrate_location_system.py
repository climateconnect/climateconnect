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
        num_user_profiles = UserProfile.objects.filter(location_id=None).count()
        user_profiles = UserProfile.objects.filter(location_id=None)
        migrate_table("profiles", num_user_profiles, user_profiles, "location", unknown_location)
        num_organizations = Organization.objects.filter(location_id=None).count()
        organizations = Organization.objects.filter(location_id=None)
        migrate_table("organizations", num_organizations, organizations, "location", unknown_location)
        num_projects = Project.objects.filter(loc_id=None).count()
        projects = Project.objects.filter(loc_id=None)
        migrate_table("projects", num_projects, projects, "loc", unknown_location)

def migrate_table(name, num_elements, elements, location_key, unknown_location):
    print("Total {name} to migrate to new location system: {number}".format(name=name, number=num_elements))
    counter = 0
    for element in elements:      
        print("City:"+ str(element.city) + " country:" + str(element.country))
        location = Location.objects.filter(city=element.city, country=element.country)
        if location.exists():
            setattr(element, location_key, location[0])
            element.save()
        elif element.city == None or element.country == None:
            setattr(element, location_key, unknown_location)
            print("no city and country. assigning unknown location to element "+ str(element.url_slug))
            element.save()
        else:
            url_root = settings.LOCATION_SERVICE_BASE_URL + "/search?q="
            url_ending = "&format=json&addressdetails=1&polygon_geojson=1"
            query = element.city + ", " + element.country
            url = url_root + query + url_ending
            response = requests.get(url)
            location_results = get_location_results(response.text)
            if(len(location_results) == 0):
                setattr(element, location_key, unknown_location)
                print("assigning unknown location for user "+element.url_slug)
                element.save()     
            else:
                print("assigning location:" + location_results[0]['name'] + " for user "+element.url_slug)
                setattr(element, location_key, get_location(location_results[0]))
                element.save()
        counter = counter + 1
        print("{counter}/{total} {name} updated ({percentage}%)".format(
            counter=counter, 
            total=num_elements,
            name=name,
            percentage=int((counter/num_elements)*100)
        ))    
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

    banned_types = ["claimed_administrative", "hamlet", "isolated_dwelling", "croft"]

    banned_osm_types = ["way"]

    raw_location_results = json.loads(res)
    location_results = []
    for loc in raw_location_results:
        if (loc['importance'] > 0.5 and 
        loc['class'] not in banned_classes and 
        loc['type'] not in banned_types and 
        loc['osm_type'] not in banned_osm_types):
            location_results.append(format_location(loc, True))
    return location_results

    
def get_global_location():
        global_location = Location.objects.filter(name="Global")
        if global_location.exists():
            return global_location[0]
        else:
            global_location = Location.objects.create(name="Global", city="global", country="global")
            return global_location

def get_unknown_location():
        unknown_location = Location.objects.filter(name="Unknown")
        if unknown_location.exists():
            return unknown_location[0]
        else:
            unknown_location = Location.objects.create(name="Unknown", city="unknown", country="unknown")
            return unknown_location