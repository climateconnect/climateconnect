from location.utility import format_location_name
from django.test import TestCase


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
