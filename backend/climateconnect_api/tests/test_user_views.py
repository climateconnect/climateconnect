from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta
from django.utils import timezone

from climateconnect_api.tasks import (fetch_entities_for_weekly_recommendations, fetch_user_info_for_weekly_recommendations)

from django.urls import reverse

from climateconnect_api.factories import UserFactory


class TestUserLoginView(APITestCase):
    def setUp(self):
        self.user = UserFactory(username="test_user", password="testing2020")

    def test_successful_login_api(self):
        url = reverse('login-api')
        data = {
            "username": "test_user",
            "password": "testing@2020"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_failed_login_api(self):
        url = reverse('login-api')
        data = {
            "username": "test",
            "password": "testing2020"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_password(self):
        url = reverse('login-api')
        data = {
            "username": "test_user"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestSignUpView(APITestCase):
    def test_signup_api_success(self):
        url = reverse('signup-api')

        data = {
            "email": "test@testovich.com",
            "password": "testing@2020",
            "first_name": "Climate",
            "last_name": "Tester",
            "country": "Germany",
            "state": "Berlin",
            "City": "Berlin"
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_signup_missing_parameter(self):
        url = reverse('signup-api')
        data = {
            "email": "test@testovich.com",
            "password": "testing@2020",
            "last_name": "Tester"
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestRecommendedEmail(APITestCase):
    # tests the blabla
    def setUp(self):
        self.user = UserFactory(username="test_user", password="testing2020")
 



    def test_entities(self):       
        max_entities = 3
        timespan = timezone.now() - timedelta(days=7)
        fetch_entities_for_weekly_recommendations(max_entities, timespan, location_id, is_in_hub)
        
        self.assertEqual()

    def test_user_data(self):
        fetch_user_info_for_weekly_recommendations(location_id, is_in_hub) 
        expected_result = [(1, 1), (1, 1),]
        self.assertEqual(expected_result)