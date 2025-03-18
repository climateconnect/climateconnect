import json

import requests
from django.conf import settings
from django.contrib.gis.geos import (
    GEOSGeometry,
    LinearRing,
    MultiPolygon,
    Point,
    Polygon,
)
from django.contrib.gis.measure import D
from rest_framework.exceptions import ValidationError

from location.models import Location
import logging

logger = logging.getLogger("django")


def get_legacy_location(location_object):
    required_params = ["country"]

    for param in required_params:
        if param not in location_object:
            raise ValidationError("Required parameter is missing:" + param)

    if "city" in location_object:
        city = location_object["city"]
    else:
        city = ""
    loc = Location.objects.filter(city=city, country=location_object["country"])
    if loc.exists():
        return loc[0]
    else:
        loc = Location.objects.create(
            city=location_object["city"],
            country=location_object["country"],
            name=location_object["city"] + ", " + location_object["country"],
        )
        return loc


def get_location(location_object):
    if settings.ENABLE_LEGACY_LOCATION_FORMAT == "True":
        return get_legacy_location(location_object)
    required_params = ["place_id", "country", "name", "type", "lon", "lat"]
    for param in required_params:
        if param not in location_object:
            raise ValidationError("Required parameter is missing:" + param)
    loc = Location.objects.filter(place_id=location_object["place_id"])
    optional_attribute_names = ["city", "state", "place_name", "exact_address"]
    optional_attributes = {}
    for attr in optional_attribute_names:
        if attr in location_object:
            optional_attributes[attr] = location_object[attr]
        else:
            optional_attributes[attr] = ""

    if loc.exists():
        return loc[0]
    elif location_object["type"] == "Point":
        point = GEOSGeometry(str(location_object["geojson"]))
        coords = list(point)
        switched_point = Point(coords[1], coords[0])
        loc = Location.objects.create(
            place_id=location_object["place_id"],
            city=optional_attributes["city"],
            state=optional_attributes["state"],
            place_name=optional_attributes["place_name"],
            exact_address=optional_attributes["exact_address"],
            country=location_object["country"],
            name=location_object["name"],
            centre_point=switched_point,
            is_formatted=True,
        )
        # Postcode location do not have an osm_id
        if "osm_id" in location_object:
            loc.osm_id = location_object["osm_id"]
        loc.save()
        return loc
    elif location_object["type"] == "LineString":
        centre_point = Point(
            float(location_object["lat"]), float(location_object["lon"])
        )
        loc = Location.objects.create(
            place_id=location_object["place_id"],
            city=optional_attributes["city"],
            state=optional_attributes["state"],
            place_name=optional_attributes["place_name"],
            exact_address=optional_attributes["exact_address"],
            country=location_object["country"],
            name=location_object["name"],
            centre_point=centre_point,
            is_formatted=True,
        )
        return loc
    elif location_object["type"] == "global":
        loc = get_global_location()
        return loc
    else:
        multipolygon = get_multipolygon_from_geojson(location_object["geojson"])
        centre_point = Point(
            float(location_object["lat"]), float(location_object["lon"])
        )
        loc = Location.objects.create(
            osm_id=location_object["osm_id"],
            place_id=location_object["place_id"],
            city=optional_attributes["city"],
            state=optional_attributes["state"],
            place_name=optional_attributes["place_name"],
            exact_address=optional_attributes["exact_address"],
            country=location_object["country"],
            name=location_object["name"],
            multi_polygon=multipolygon,
            is_formatted=True,
            centre_point=centre_point,
        )
        return loc


def get_multipolygon_from_geojson(geojson):
    input_polygon = GEOSGeometry(str(geojson))

    if isinstance(input_polygon, Polygon):
        return MultiPolygon(get_polygon_with_switched_coordinates(input_polygon))
    elif isinstance(input_polygon, MultiPolygon):
        polygons = list(input_polygon)
        switched_multipolygon = []
        for polygon in polygons:
            switched_polygon = get_polygon_with_switched_coordinates(polygon)
            switched_multipolygon.append(switched_polygon)
        return MultiPolygon(switched_multipolygon)
    else:
        raise Exception("PolygonInstanceNotFound: Wrong input")


def get_polygon_with_switched_coordinates(polygon):
    switched_poly = []
    linear_rings = list(polygon)
    for ring in linear_rings:
        switched_ring = []
        points = list(ring)
        for point in points:
            switched_point = (point[1], point[0])
            switched_ring.append(switched_point)
        switched_poly.append(LinearRing(switched_ring))

    return Polygon(*switched_poly)


# Commenter: Chris
# The code for formatting a location is the same code as in the frontend pythonized.
# The reason why we have it here as well is to format locations that we retrieved
# with direct requests from the backend to nominatim.
# This means changes made here or in the equivelant function in the frontend also need to
# be applied to the other function so they stay consistent
# This whole setup is less than ideal and should be changed in the future.


def format_location(location_string, already_loaded):
    if already_loaded:
        location_object = location_string
    else:
        if isinstance(location_string, dict):
            location_object = location_string
        else:
            location_object = json.loads(location_string)[0]
    location_name = format_location_name(location_object)
    return {
        "type": location_object["geojson"]["type"],
        "place_id": location_object["place_id"],
        "osm_id": location_object["osm_id"],
        "name": location_name["name"],
        "city": location_name["city"],
        "state": location_name["state"],
        "country": location_name["country"],
        "geojson": location_object["geojson"],
        "coordinates": location_object["geojson"]["coordinates"],
        "lon": location_object["lon"],
        "lat": location_object["lat"],
    }


def format_location_name(location):
    first_part_order = [
        "village",
        "town",
        "city_district",
        "suburb",
        "borough",
        "subdivision",
        "neighbourhood",
        "place",
        "city",
        "district",
        "municipality",
        "county",
        "state_district",
        "province",
        "state",
        "region",
    ]
    middle_part_order = [
        "city_district",
        "district",
        "suburb",
        "borough",
        "subdivision",
        "neighbourhood",
        "town",
        "village",
    ]
    if is_country(location):
        return {
            "country": location["address"]["country"],
            "city": "",
            "state": "",
            "name": location["display_name"],
        }

    middle_part_suffixes = ["city", "state"]
    first_part = get_first_part(location["address"], first_part_order)
    middle_part = get_middle_part(
        location["address"], middle_part_order, middle_part_suffixes
    )
    return {
        "city": first_part,
        "state": middle_part,
        "country": location["address"]["country"],
        "name": first_part
        + ", "
        + middle_part
        + (", " if len(middle_part) > 0 else "")
        + location["address"]["country"],
    }


def is_country(location):
    if location["type"] != "administrative":
        return False
    # short circuit if the address contains any information other than country and country code
    for key in location["address"].keys():
        if key not in ["country", "country_code"]:
            return False
    return True


def get_first_part(address, order):
    for loc_type_descriptor in order:
        if loc_type_descriptor in address.keys():
            if loc_type_descriptor == "state":
                return address[loc_type_descriptor] + " (state)"
            return address[loc_type_descriptor]
    return ""


def get_middle_part(address, order, suffixes):
    for loc_type_descriptor in order:
        if loc_type_descriptor in address.keys():
            for suffix in suffixes:
                if suffix in address.keys():
                    return address[suffix]
    return ""


def get_location_with_range(query_params):
    filter_place_id = query_params.get("place")
    location_type = query_params.get("loc_type")
    locations = Location.objects.filter(place_id=filter_place_id)
    # shrink polygon by 1 meter to exclude places that share a border
    # Example: Don't show projects from the USA when searching for Mexico
    distance = -1  # distance in meter
    buffer_width = distance / 40000000.0 * 360.0
    if not locations.exists():
        url_root = settings.LOCATION_SERVICE_BASE_URL + "/lookup?osm_ids="
        # Append osm_id to first letter of osm_type as uppercase letter
        osm_id_param = query_params.get("loc_type")[0].upper() + query_params.get("osm")
        params = "&format=json&addressdetails=1&polygon_geojson=1&accept-language=en-US,en;q=0.9&polygon_threshold=0.001"
        url = url_root + osm_id_param + params
        response = requests.get(url)
        try:
            location_object = json.loads(response.text)[0]
        except ValueError as e:
            logger.error("#" * 40)
            logger.error("Error while fetching location:")
            logger.error("-" * 40)
            logger.error("locations:")

            for loc in Location.objects.all():
                logger.error(
                    "name:\t"
                    + str(loc.name)
                    + "\t|place:\t"
                    + str(loc.place_id)
                    + "\t|osm:\t"
                    + str(loc.osm_id)
                )

            logger.error("-" * 40)
            logger.error("place:\t" + filter_place_id)
            logger.error("location_type:\t" + location_type)
            logger.error("osm:\t" + query_params.get("osm"))
            logger.error("URL:\t" + url)
            logger.error("=" * 40)
            logger.error("Response:\t" + response.text)
            logger.error("-" * 40)
            logger.error("Response Status:\t" + str(response.status_code))
            logger.error("=" * 40)
            logger.error("Trace:\n", exc_info=True)
            logger.error("#" * 40)

            raise ValidationError("Error while fetching location: " + str(e))

        location = get_location(format_location(location_object, False))
        location_in_db = (
            location.multi_polygon.buffer(buffer_width)
            if location_type == "relation"
            else location.centre_point
        )
    else:
        location = locations[0]
        location_in_db = (
            location.multi_polygon.buffer(buffer_width)
            if location_type == "relation"
            else location.centre_point
        )
    radius = 0
    if "radius" in query_params:
        radius_value = query_params.get("radius")
        radius = D(km=radius_value)
    return {"location": location_in_db, "radius": radius, "country": location.country}


def get_global_location():
    global_location = Location.objects.filter(name="Global")
    if global_location.exists():
        return global_location[0]
    else:
        global_location = Location.objects.create(
            name="Global",
            city="global",
            country="global",
            place_id=1,
            is_formatted=True,
        )
        return global_location
