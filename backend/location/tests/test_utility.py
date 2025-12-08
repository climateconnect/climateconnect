import unittest

from django.test import TestCase, override_settings

from location.utility import _osm_type_char, get_location
from location.models import Location


class TestOsmTypeChar(unittest.TestCase):
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


@unittest.skip("Skipped until migration 0013 has been applied to production DB")
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
        self.assertEqual(location.osm_class_type, "Point")  
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
