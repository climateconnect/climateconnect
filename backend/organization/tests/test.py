from rest_framework.test import APITestCase
from rest_framework import status

from django.urls import reverse, resolve
import logging

log = logging.getLogger(__name__)

from climateconnect_api.factories import UserFactory


class TestUserProjects(APITestCase):
    def setUp(self):
        print("Test !!! 💜")
        self.user = UserFactory(username="fnayouseif+001@gmail.com", password="123456")

    def test_user_leave_project(self):

        url = "http://localhost:8000/api/projects/leaveproject/"  # resolve('projects/leaveproject/')
        data = {
            "project_id": "455",
        }

        response = self.client.post(url, data, format="json")
        log.info(response)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
