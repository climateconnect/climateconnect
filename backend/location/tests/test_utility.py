from django.test import TestCase, override_settings

from location.models import Location
from location.utility import _osm_type_char, format_location_name, get_location


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

    @override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")
    def test_legacy_location_format(self):
        """Test that legacy format still works."""
        legacy_location = {
            "city": "Berlin",
            "country": "Germany"
        }
        location = get_location(legacy_location)

        self.assertEqual(location.city, "Berlin")
        self.assertEqual(location.country, "Germany")
