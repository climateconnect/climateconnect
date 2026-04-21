from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from location.models import Location


class TestGetLocationView(APITestCase):

    def setUp(self):
        self.url = reverse("location:get-location")

    def test_get_location_uses_osm_composite_when_both_osm_and_place_are_provided(self):
        place_match = Location.objects.create(
            name="Place Match",
            city="Berlin",
            country="Germany",
            place_id=123,
            osm_id=999,
            osm_type="R",
            osm_class="legacy",
        )
        osm_match = Location.objects.create(
            name="OSM Match",
            city="Berlin",
            country="Germany",
            place_id=456,
            osm_id=62422,
            osm_type="R",
            osm_class="boundary",
        )

        response = self.client.post(
            self.url,
            {
                "place_id": 123,
                "osm_id": 62422,
                "osm_type": "relation",
                "osm_class": "boundary",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], osm_match.name)
        self.assertNotEqual(response.data["name"], place_match.name)

    def test_get_location_returns_newest_for_duplicate_osm_composite(self):
        older = Location.objects.create(
            name="Berlin Older",
            city="Berlin",
            country="Germany",
            place_id=100,
            osm_id=62422,
            osm_type="R",
            osm_class="boundary",
        )
        newer = Location.objects.create(
            name="Berlin Newer",
            city="Berlin",
            country="Germany",
            place_id=101,
            osm_id=62422,
            osm_type="R",
            osm_class="boundary",
        )

        response = self.client.post(
            self.url,
            {
                "osm_id": 62422,
                "osm_type": "relation",
                "osm_class": "boundary",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], newer.name)
        self.assertNotEqual(response.data["name"], older.name)
