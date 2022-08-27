from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse


class TestPingPongAPI(APITestCase):
    def test_ping_pong_api_success(self):
        url = reverse("ping-pong-api")
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
