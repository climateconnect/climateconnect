from rest_framework.test import APITestCase
from rest_framework import status

from django.urls import reverse

from climateconnect_api.factories import UserFactory
from climateconnect_api.models.language import Language


class TestUserLoginView(APITestCase):
    def setUp(self):
        self.user = UserFactory(username="test_user", password="testing2020")

    def test_successful_login_api(self):
        url = reverse("login-api")
        print(url)
        data = {"username": "test_user", "password": "testing@2020"}
        response = self.client.post(url, data, format="json")
        print("💜")
        print(response)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_failed_login_api(self):
        url = reverse("login-api")
        data = {"username": "test", "password": "testing2020"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_password(self):
        url = reverse("login-api")
        data = {"username": "test_user"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestSignUpView(APITestCase):
    def test_signup_api_success(self):
        url = reverse("signup-api")

        data = {
            "City": "Berlin",
            "country": "Germany",
            "email": "test@testovich.com",
            "first_name": "Climate",
            "last_name": "Tester",
            # "language": "en",
            "location": {
                "type": "Point",
                "coordinates": [11.0056, 49.5928616],
                "geojson": {"type": "Point", "coordinates": [11.0056, 49.5928616]},
                "place_id": 340512767,
                "osm_id": 17193023,
                "name": "Erlangen, Germany",
                "lon": "11.0056",
                "lat": "49.5928616",
                "city": "Erlangen",
                "state": "",
                "country": "Germany",
            },
            "password": "testing@2020",
            # "send_newsletter": "true",
            "send_newsletter": True,
            "source_language": "en",
            "state": "Berlin",
        }

        language, created = Language.objects.get_or_create(
            # name="english", native_name="english", language_code="en"
            language_code="en"
        )

        # language, is_created = Language.objects.get_or_create(short_name=used_language)
        response = self.client.post(url, data, format="json")
        print("💜")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_signup_missing_parameter(self):
        url = reverse("signup-api")
        data = {
            "email": "test@testovich.com",
            "password": "testing@2020",
            "last_name": "Tester",
        }

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
