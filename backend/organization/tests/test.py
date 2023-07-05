from rest_framework.test import APITestCase
from rest_framework import status
from climateconnect_api.factories import UserFactory

import logging

log = logging.getLogger(__name__)


class TestUserProjects(APITestCase):
    def setUp(self):
        self.user = UserFactory(username="fnayouseif+001@gmail.com", password="123456")

    def test_user_leave_project(self):
        url = "http://localhost:8000/api/projects/leaveproject/"  # resolve('projects/leaveproject/')
        data = {
            "project_id": "455",
        }

        response = self.client.post(url, data, format="json")
        log.info(response)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
