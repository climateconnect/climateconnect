import json
import logging

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

logger = logging.getLogger("django")


# Adapter: Converts a Django Location instance to a dict compatible with format_location_name
def location_obj_to_dict(location):
    """
    Converts a Django Location model instance to a dict with the structure expected by format_location_name.
    """
    # Compose a fake Nominatim-like dict
    address = {
        "city": location.city or "",
        "state": location.state or "",
        "country": location.country or "",
    }
    # Add more address fields if needed
    display_name = (
        location.display_name
        if hasattr(location, "display_name") and location.display_name
        else location.name
    )
    type = getattr(location, "type", "administrative")
    return {
        "type": type,
        "address": address,
        "display_name": display_name,
    }


def format_translation_data(translation_data: dict) -> dict:
    formatted_data = {}
    formatted_data["address"] = {
        "city": translation_data.get("city_translation") or "",
        "state": translation_data.get("state_translation") or "",
        "country": translation_data.get("country_translation") or "",
    }

    formatted_data["display_name"] = translation_data.get("name_translation") or ""

    return formatted_data


def _osm_type_char(v):
    if v is None:
        return None
    mapping = {"relation": "R", "way": "W", "node": "N", "r": "R", "w": "W", "n": "N"}
    return mapping.get(str(v).lower())


def _has_non_empty_value(value):
    return value is not None and value != ""


def _has_osm_composite_key(location_object):
    return (
        _has_non_empty_value(location_object.get("osm_id"))
        and _has_non_empty_value(_osm_type_char(location_object.get("osm_type")))
        and _has_non_empty_value(location_object.get("osm_class"))
    )


def _get_newest_location_by_osm_composite(osm_id, osm_type, osm_class):
    return (
        Location.objects.filter(
            osm_id=osm_id,
            osm_type=_osm_type_char(osm_type),
            osm_class=osm_class,
        )
        .order_by("-id")
        .first()
    )


def _get_newest_location_by_osm_id_and_type(osm_id, osm_type):
    """Backward-compatible fallback when osm_class is not yet available."""
    return (
        Location.objects.filter(
            osm_id=osm_id,
            osm_type=_osm_type_char(osm_type),
        )
        .order_by("-id")
        .first()
    )


def _get_newest_location_by_place_id(place_id):
    if not _has_non_empty_value(place_id):
        return None
    return Location.objects.filter(place_id=place_id).order_by("-id").first()


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

    if location_object.get("type") == "global":
        return get_global_location()

    # --- Try DB first (before validating required fields for creation) ---
    # This allows backward-compatible place_id-only requests to resolve
    # to an existing record even when OSM fields are not provided.
    has_osm_composite_key = _has_osm_composite_key(location_object)

    if has_osm_composite_key:
        # Migration note: OSM composite key is the primary, stable identifier.
        # If duplicates still exist for the same key, we always use the newest row.
        loc = _get_newest_location_by_osm_composite(
            osm_id=location_object.get("osm_id"),
            osm_type=location_object.get("osm_type"),
            osm_class=location_object.get("osm_class"),
        )
        if loc:
            return loc

    place_id = location_object.get("place_id")
    if _has_non_empty_value(place_id):
        logger.warning(
            "Using deprecated place_id lookup for location. place_id=%s", place_id
        )
        loc = _get_newest_location_by_place_id(place_id)
        if loc:
            return loc

    # Location not found in DB; validate required fields before creating a new record.
    required_params = [
        "country",
        "name",
        "type",
        "lon",
        "lat",
        "osm_id",
        "osm_type",
        "osm_class",
        "osm_class_type",
        "display_name",
    ]
    for param in required_params:
        if param not in location_object:
            raise ValidationError("Required parameter is missing:" + param)

    if not location_object.get("is_stub") and not has_osm_composite_key:
        raise ValidationError(
            "Required OSM composite key is missing: osm_id, osm_type, osm_class"
        )

    optional_attribute_names = ["city", "state", "place_name", "exact_address"]

    for attr in optional_attribute_names:
        location_object[attr] = location_object.get(attr, "")

    centre_point = None
    multipolygon = None
    if location_object["type"] == "Point":
        point = GEOSGeometry(json.dumps(location_object["geojson"]))
        coords = list(point)
        centre_point = Point(coords[1], coords[0])

    elif location_object["type"] == "LineString":
        centre_point = Point(
            float(location_object["lat"]), float(location_object["lon"])
        )

    elif (
        location_object["type"] == "Polygon"
        or location_object["type"] == "MultiPolygon"
    ):
        multipolygon = get_multipolygon_from_geojson(location_object["geojson"])
        centre_point = Point(
            float(location_object["lat"]), float(location_object["lon"])
        )
    else:
        raise Exception("Unsupported location type")

    loc = Location.objects.create(
        osm_id=location_object.get("osm_id"),
        osm_type=_osm_type_char(location_object.get("osm_type")),
        osm_class=location_object.get("osm_class"),
        osm_class_type=location_object.get("osm_class_type"),
        place_id=location_object.get("place_id"),
        city=location_object["city"],
        state=location_object["state"],
        place_name=location_object["place_name"],
        display_name=location_object.get("display_name"),
        exact_address=location_object["exact_address"],
        country=location_object["country"],
        name=location_object["name"],
        centre_point=centre_point,
        multi_polygon=multipolygon,
        is_formatted=True,
    )

    return loc


def get_multipolygon_from_geojson(geojson):
    geojson_str = geojson if isinstance(geojson, str) else json.dumps(geojson)
    input_polygon = GEOSGeometry(geojson_str)

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
        "osm_type": _osm_type_char(location_object["osm_type"]),
        "osm_class": location_object["class"],
        "osm_class_type": location_object["type"],
        "name": location_name["name"],
        "display_name": location_object["display_name"],
        "city": location_name["city"],
        "state": location_name["state"],
        "country": location_name["country"],
        "geojson": location_object["geojson"],
        "coordinates": location_object["geojson"]["coordinates"],
        "lon": location_object["lon"],
        "lat": location_object["lat"],
    }


CUSTOM_NAME_MAPPINGS = {"Scotland (state), Scotland": "Scotland"}

# These country codes have states that should be shown as the location's "country" part
# because the actual country name is less meaningful for display (e.g. UK nations)
MAP_STATE_TO_COUNTRY_CODES = {"gb"}


# This function has an equivalent in backend/location/utility.py -> format_location_name
# We should consider using the same codebase for these
def format_location_name(location):
    first_part_order = [
        "hamlet",
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
        "county",
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

    middle_part_suffixes = ["town", "city", "county", "state"]
    first_part = get_first_part(location["address"], first_part_order)
    middle_part = get_middle_part(
        location["address"], middle_part_order, middle_part_suffixes
    )
    last_part = (
        location["address"]["state"]
        if location["address"].get("country_code", "").lower()
        in MAP_STATE_TO_COUNTRY_CODES
        and location["address"].get("state")
        else location["address"].get("country", "")
    )
    name = build_location_name(first_part, middle_part, last_part)

    # For certain locations our automatic name generation doesn't work. In this case we
    # want to override the name with a custom one
    if name in CUSTOM_NAME_MAPPINGS:
        name = CUSTOM_NAME_MAPPINGS[name]
    return {
        "city": first_part,
        "state": location["address"].get("state") or middle_part,
        "country": location["address"].get("country", ""),
        "name": name,
    }


def build_location_name(first_part, middle_part, last_part):
    name_parts = []
    if first_part:
        name_parts.append(first_part)
    if middle_part and middle_part != first_part and middle_part != last_part:
        name_parts.append(middle_part)
    if last_part and (not first_part or last_part != first_part):
        name_parts.append(last_part)
    return ", ".join(name_parts)


def is_country(location):
    if location.get("addresstype") == "state":
        return False

    if location.get("type") == "administrative":
        # treat as country if the address contains only country info
        for key in location["address"].keys():
            if key not in ["country", "country_code"]:
                return False
        return True

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
    filter_place_id = query_params.get("place_id")
    filter_osm_type = query_params.get("osm_type")
    filter_osm_id = query_params.get("osm_id")
    filter_osm_class = query_params.get("osm_class")

    location = None
    if (
        _has_non_empty_value(filter_osm_id)
        and _has_non_empty_value(filter_osm_type)
        and _has_non_empty_value(filter_osm_class)
    ):
        location = _get_newest_location_by_osm_composite(
            osm_id=filter_osm_id,
            osm_type=filter_osm_type,
            osm_class=filter_osm_class,
        )

    if (
        not location
        and _has_non_empty_value(filter_osm_id)
        and _has_non_empty_value(filter_osm_type)
    ):
        # Backward-compatible fallback for requests without osm_class.
        location = _get_newest_location_by_osm_id_and_type(
            filter_osm_id, filter_osm_type
        )

    if not location and _has_non_empty_value(filter_place_id):
        logger.warning(
            "Using deprecated place_id lookup in location range filter. place_id=%s",
            filter_place_id,
        )
        location = _get_newest_location_by_place_id(filter_place_id)

    # shrink polygon by 1 meter to exclude places that share a border
    # Example: Don't show projects from the USA when searching for Mexico
    distance = -1  # distance in meter
    buffer_width = distance / 40000000.0 * 360.0

    normalized_osm_type = _osm_type_char(filter_osm_type)

    if not location:
        url_root = settings.LOCATION_SERVICE_BASE_URL + "/lookup?osm_ids="
        if not _has_non_empty_value(filter_osm_id) or not _has_non_empty_value(
            normalized_osm_type
        ):
            raise ValidationError(
                "Missing location lookup parameters: osm_id and osm_type are required"
            )

        # Append osm_id to first letter of osm_type as uppercase letter
        osm_id_param = normalized_osm_type + str(filter_osm_id)
        params = "&format=json&addressdetails=1&polygon_geojson=1&accept-language=en-US,en;q=0.9&polygon_threshold=0.001"
        url = url_root + osm_id_param + params
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        try:
            response = requests.get(url, headers=headers, timeout=5)
        except requests.RequestException as exc:
            raise ValidationError(
                f"Error while fetching location from upstream service: {exc}"
            ) from exc
        if response.status_code == 200:
            try:
                data = json.loads(response.text)
            except ValueError as exc:
                raise ValidationError(
                    "Invalid JSON response from upstream location service."
                ) from exc
            if not isinstance(data, list) or not data:
                raise ValidationError(
                    f"Location not found in upstream service for osm_id={filter_osm_id}, osm_type={normalized_osm_type}"
                )
            location_object = data[0]
        else:
            logger.error(
                "Error while fetching location: " + "\nresponse:" + response.text
            )

            # try to use the location within the query params (provided by the client via the post request)
            # as a backup if the location could not be fetched from the api
            if "location" not in query_params:
                raise ValidationError(
                    f"Error while fetching location and no backup option: {response.status_code} | "
                    + response.text
                )

            location_object = query_params.get("location")

        location = get_location(format_location(location_object, False))
        is_area = normalized_osm_type == "R" and location.multi_polygon is not None
        location_in_db = (
            location.multi_polygon.buffer(buffer_width)
            if is_area
            else location.centre_point
        )
    else:
        # For place_id-only requests normalized_osm_type may be None;
        # fall back to the resolved location's own osm_type.
        effective_osm_type = normalized_osm_type or location.osm_type
        is_area = effective_osm_type == "R" and location.multi_polygon is not None
        location_in_db = (
            location.multi_polygon.buffer(buffer_width)
            if is_area
            else location.centre_point
        )
    radius = 0
    if "radius" in query_params:
        radius_value = query_params.get("radius")
        radius = D(km=radius_value)
    return {"location": location_in_db, "radius": radius, "country": location.country}


def get_global_location():
    # The data migration 0018 ensures the existing "Global" row already has these
    # synthetic OSM fields populated, so get_or_create will find it rather than
    # create a duplicate.
    global_location, _ = Location.objects.get_or_create(
        osm_id=-1,
        osm_type="R",
        osm_class="global",
        defaults={
            "name": "Global",
            "city": "global",
            "country": "global",
            "display_name": "Global",
            "osm_class_type": "global",
            "place_id": 1,
            "is_formatted": True,
        },
    )
    return global_location
