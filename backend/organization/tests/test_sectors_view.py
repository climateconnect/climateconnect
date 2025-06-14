from rest_framework.test import APITestCase
from rest_framework import status
from organization.models import Sector

from django.urls import reverse
from django.test import tag


class TestSectorsView(APITestCase):
    # -----------------------------------------------------
    # setUp code for each test
    def setUp(self):
        self.url = reverse("organization:sectors")

        # Create a test sector
        self.sector = Sector.objects.create(
            name="Test Sector Name 1",
            name_de_translation="Test Sector Name 1 DE",
            key="test_sector_1",
            # description="This is a test sector.",
            # image="path/to/image.jpg",
            # icon="path/to/icon.png",
            # thumbnail_image="path/to/thumbnail.jpg",
            # image_attribution="Test Attribution",
        )

    # -----------------------------------------------------
    # Tests for the SectorsView API
    @tag("sectors")
    def test_get_sector_list_url_resolves_corretly(self):
        self.assertEqual(self.url, "/api/sectors/")

    @tag("sectors")
    def test_get_sector_list_url_reachable(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/json")

    @tag("sectors")
    def test_get_sector_list_contains_sectors_names(self):
        self.sector = Sector.objects.create(
            name="Test Sector Name 2",
            name_de_translation="Test Sector Name 2 DE",
            key="test_sector_2",
        )

        response = self.client.get(self.url)
        self.assertContains(response, "Test Sector Name 1")
        self.assertContains(response, "Test Sector Name 2")
