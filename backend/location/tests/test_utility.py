from django.contrib.gis.geos import Point
from django.test import TestCase, override_settings

from location.models import Location
from location.utility import (
    _get_newest_location_by_osm_composite,
    _osm_type_char,
    format_location_name,
    get_global_location,
    get_location,
    get_location_with_range,
)


class TestFormatLocationName(TestCase):
    def test_country_location(self):
        """
        Test formatting when the location is a country.
        """
        location = {
            "type": "administrative",
            "address": {"country": "Canada", "country_code": "ca"},
            "display_name": "Canada",
        }
        expected_result = {
            "country": "Canada",
            "city": "",
            "state": "",
            "name": "Canada",
        }
        result = format_location_name(location)
        self.assertEqual(expected_result, result)

    def test_city_location(self):
        """
        Test formatting when the location is a city.
        """
        location = {
            "type": "city",
            "address": {
                "city": "City-Sample",
                "state": "State-Sample",
                "country": "Country-Sample",
            },
            "display_name": "Display-Name-Sample",
        }
        expected_result = {
            "city": "City-Sample",
            "state": "State-Sample",
            "country": "Country-Sample",
            "name": "City-Sample, Country-Sample",
        }
        result = format_location_name(location)
        self.assertEqual(expected_result, result)

    def test_location_with_hamlet(self):
        """
        Test formatting when the location is a hamlet.
        """
        location = {
            "type": "hamlet",
            "addresstype": "hamlet",
            "class": "place",
            "name": "Hamlet-Sample",
            "address": {
                "hamlet": "Hamlet-Sample",
                "town": "Town-Sample",
                "county": "County-Sample",
                "state": "State-Sample",
                "country": "Country-Sample",
            },
            "display_name": "Display-Name-Sample",
        }
        expected_result = {
            "city": "Hamlet-Sample",
            "state": "State-Sample",
            "country": "Country-Sample",
            "name": "Hamlet-Sample, Town-Sample, Country-Sample",
        }
        result = format_location_name(location)
        self.assertEqual(expected_result, result)

    def test_location_with_hamlet_without_town(self):
        """
        Test formatting when the location is a hamlet without town.
        """
        location = {
            "type": "hamlet",
            "addresstype": "hamlet",
            "class": "place",
            "name": "Hamlet-Sample",
            "address": {
                "hamlet": "Hamlet-Sample",
                "county": "County-Sample",
                "state": "State-Sample",
                "country": "Country-Sample",
            },
            "display_name": "Display-Name-Sample",
        }
        expected_result = {
            "city": "Hamlet-Sample",
            "state": "State-Sample",
            "country": "Country-Sample",
            "name": "Hamlet-Sample, County-Sample, Country-Sample",
        }
        result = format_location_name(location)
        self.assertEqual(expected_result, result)

    def test_location_with_custom_name_mapping(self):
        """
        Test formatting when the name is overridden by the CUSTOM_NAME_MAPPINGS in utility.py.
        """
        location = {
            "type": "administrative",
            "addresstype": "state",
            "name": "Scotland",
            "address": {
                "state": "Scotland",
                "country": "United Kingdom",
            },
            "display_name": "Scotland, United Kingdom",
        }
        expected_result = {
            "city": "Scotland (state)",
            "state": "Scotland",
            "country": "United Kingdom",
            "name": "Scotland",
        }
        result = format_location_name(location)
        self.assertEqual(expected_result, result)


class TestOsmTypeChar(TestCase):
    """Tests for the _osm_type_char function."""

    def test_relation_lowercase(self):
        self.assertEqual(_osm_type_char("relation"), "R")

    def test_way_lowercase(self):
        self.assertEqual(_osm_type_char("way"), "W")

    def test_node_lowercase(self):
        self.assertEqual(_osm_type_char("node"), "N")

    def test_single_char_lowercase(self):
        self.assertEqual(_osm_type_char("r"), "R")
        self.assertEqual(_osm_type_char("w"), "W")
        self.assertEqual(_osm_type_char("n"), "N")

    def test_single_char_uppercase(self):
        self.assertEqual(_osm_type_char("R"), "R")
        self.assertEqual(_osm_type_char("W"), "W")
        self.assertEqual(_osm_type_char("N"), "N")

    def test_none_input(self):
        self.assertIsNone(_osm_type_char(None))

    def test_unknown_value(self):
        self.assertIsNone(_osm_type_char("unknown"))


class TestGetLocation(TestCase):
    """Tests for the get_location function with OSM data."""

    def setUp(self):
        self.valid_location_object = {
            "place_id": 12345,
            "country": "Germany",
            "name": "Berlin",
            "type": "Point",
            "lon": "13.405",
            "lat": "52.52",
            "osm_id": 62422,
            "osm_type": "relation",
            "osm_class": "boundary",
            "osm_class_type": "administrative",
            "display_name": "Berlin, Germany",
            "geojson": {"type": "Point", "coordinates": [13.405, 52.52]},
        }

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_osm_fields_saved_correctly(self):
        """Test that osm_id, osm_type, osm_class, osm_class_type and display_name are saved."""
        location = get_location(self.valid_location_object)

        self.assertEqual(location.osm_id, 62422)
        self.assertEqual(location.osm_type, "R")
        self.assertEqual(location.osm_class, "boundary")
        self.assertEqual(location.osm_class_type, "administrative")
        self.assertEqual(location.display_name, "Berlin, Germany")

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_osm_type_mapping_way(self):
        """Test that osm_type 'way' is correctly mapped to 'W'."""
        self.valid_location_object["osm_type"] = "way"
        location = get_location(self.valid_location_object)

        self.assertEqual(location.osm_type, "W")

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_osm_type_mapping_node(self):
        """Test that osm_type 'node' is correctly mapped to 'N'."""
        self.valid_location_object["osm_type"] = "node"
        location = get_location(self.valid_location_object)

        self.assertEqual(location.osm_type, "N")

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_osm_type_mapping_relation(self):
        """Test that osm_type 'relation' is correctly mapped to 'R'."""
        self.valid_location_object["osm_type"] = "relation"
        location = get_location(self.valid_location_object)

        self.assertEqual(location.osm_type, "R")

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_existing_location_returned(self):
        """Test that existing location is returned instead of creating a new one."""
        # Create first location
        location1 = get_location(self.valid_location_object)

        # Try to get same location again
        location2 = get_location(self.valid_location_object)

        self.assertEqual(location1.id, location2.id)
        self.assertEqual(Location.objects.filter(place_id=12345).count(), 1)

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_optional_fields_default_to_empty_string(self):
        """Test that optional fields default to empty strings when not provided."""
        # Remove optional fields
        location_object = self.valid_location_object.copy()
        # city, state, place_name, exact_address are optional

        location = get_location(location_object)

        self.assertEqual(location.city, "")
        self.assertEqual(location.state, "")
        self.assertEqual(location.place_name, "")
        self.assertEqual(location.exact_address, "")

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_returns_newest_for_duplicate_osm_composite(self):
        """When duplicates exist for one OSM composite key, newest (highest id) is returned."""
        older = Location.objects.create(
            name="Berlin Older",
            city="Berlin",
            country="Germany",
            osm_id=62422,
            osm_type="R",
            osm_class="boundary",
            place_id=100,
        )
        newer = Location.objects.create(
            name="Berlin Newer",
            city="Berlin",
            country="Germany",
            osm_id=62422,
            osm_type="R",
            osm_class="boundary",
            place_id=101,
        )

        result = _get_newest_location_by_osm_composite(62422, "relation", "boundary")

        self.assertEqual(result.id, newer.id)
        self.assertNotEqual(result.id, older.id)

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_get_location_prefers_osm_composite_over_place_id(self):
        """OSM composite lookup must take precedence when both OSM and place_id are available."""
        Location.objects.create(
            name="Legacy Place Match",
            city="Berlin",
            country="Germany",
            place_id=12345,
            osm_id=1,
            osm_type="R",
            osm_class="old",
        )

        expected = Location.objects.create(
            name="OSM Match",
            city="Berlin",
            country="Germany",
            place_id=99999,
            osm_id=62422,
            osm_type="R",
            osm_class="boundary",
        )

        result = get_location(self.valid_location_object)
        self.assertEqual(result.id, expected.id)

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_global_location_has_synthetic_osm_fields(self):
        global_location = get_global_location()

        self.assertEqual(global_location.name, "Global")
        self.assertEqual(global_location.osm_id, -1)
        self.assertEqual(global_location.osm_type, "R")
        self.assertEqual(global_location.osm_class, "global")
        self.assertEqual(global_location.osm_class_type, "global")

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")
    def test_legacy_location_format(self):
        """Test that legacy format still works."""
        legacy_location = {"city": "Berlin", "country": "Germany"}
        location = get_location(legacy_location)

        self.assertEqual(location.city, "Berlin")
        self.assertEqual(location.country, "Germany")


class TestGetLocationWithRange(TestCase):
    """Tests for get_location_with_range, specifically the newest-record selection."""

    def _make_location(self, name, country, place_id, osm_id=62422):
        """Helper to create a Location with a centre_point geometry."""
        return Location.objects.create(
            name=name,
            city="Berlin",
            country=country,
            osm_id=osm_id,
            osm_type="W",
            osm_class="boundary",
            place_id=place_id,
            centre_point=Point(13.4050, 52.5200),
        )

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_returns_newest_for_duplicate_osm_composite(self):
        """When multiple records share the same OSM composite key,
        get_location_with_range must use the newest (highest ID) record."""
        self._make_location("Berlin Older", "OldCountry", place_id=100)
        newer = self._make_location("Berlin Newer", "NewCountry", place_id=101)

        result = get_location_with_range(
            {"osm_id": 62422, "osm_type": "way", "osm_class": "boundary"}
        )

        self.assertEqual(result["country"], newer.country)

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="False")
    def test_place_id_fallback_resolves_location(self):
        """When only place_id is provided (no OSM params), the existing
        location must still be resolved via the deprecated place_id path."""
        location = self._make_location("Berlin", "Germany", place_id=999)

        result = get_location_with_range({"place_id": 999})

        self.assertEqual(result["country"], location.country)
