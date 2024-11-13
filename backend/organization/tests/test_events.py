from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch
from datetime import datetime, timedelta
from ..models import Project
from ..models.type import ProjectTypesChoices
from ..views.project_views import ListEventView


class TestListEventView(TestCase):
    def setUp(self):
        self.url = "/api/events/"

        self.project1 = Project.objects.create(
            name="Event 1",
            start_date=datetime.now() - timedelta(days=10),
            end_date=datetime.now() + timedelta(days=10),
            project_type=ProjectTypesChoices.event,
            is_draft=False,
        )
        self.project2 = Project.objects.create(
            name="Event 2",
            start_date=datetime.now() - timedelta(days=20),
            end_date=datetime.now() + timedelta(days=5),
            project_type=ProjectTypesChoices.event,
            is_draft=False,
        )
        self.project3 = Project.objects.create(
            name="Event 3",
            start_date=datetime.now() - timedelta(days=30),
            end_date=datetime.now() + timedelta(days=15),
            project_type=ProjectTypesChoices.event,
            is_draft=False,
        )

    def test_get_events(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_get_events_with_start_date_filter(self):
        start_date = (datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d")
        response = self.client.get(f"{self.url}?start_date={start_date}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_events_with_end_date_filter(self):
        end_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        response = self.client.get(f"{self.url}?end_date={end_date}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_events_with_start_and_end_date_filter(self):
        start_date = (datetime.now() - timedelta(days=25)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        response = self.client.get(
            f"{self.url}?start_date={start_date}&end_date={end_date}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
