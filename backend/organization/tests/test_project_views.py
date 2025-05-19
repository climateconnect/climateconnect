from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from django.contrib.auth.models import User

from django.urls import reverse
from django.test import tag

from organization.models.type import ProjectTypesChoices
from climateconnect_api.models.language import Language
from organization.models import Sector, Project, ProjectStatus, ProjectSectorMapping
from location.models import Location

from PIL import Image
from base64 import b64encode
import io

# set this at lowest to 4
INITIAL_PROJECT_COUNT = 4


class TestProjectsListView(APITestCase):
    # -----------------------------------------------------
    # setUp code for each test
    def setUp(self):
        self.url = reverse("organization:list-projects")

        projectStatus_active = ProjectStatus.objects.create(
            name="active",
            name_de_translation="aktiv",
            has_end_date=False,
            has_start_date=False,
        )

        self.projects = [
            Project.objects.create(
                name=f"Test Project {i}",
                description=f"Test Project {i} Description",
                url_slug=f"test-project-{i}",
                is_active=True,
                status=projectStatus_active,
            )
            for i in range(1, INITIAL_PROJECT_COUNT + 1)
        ]

    # -----------------------------------------------------
    # Tests for the ProjectsList API

    @tag("projects")
    def test_get_projects_list_url_resolves_corretly(self):
        self.assertEqual(self.url, "/api/projects/")

    @tag("projects")
    def test_get_projects_list_url_reachable(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/json")

    @tag("projects")
    def test_get_projects_lists_content(self):
        # arrange

        # act
        response = self.client.get(self.url)
        results = response.json().get("results", None)

        for i in range(1, INITIAL_PROJECT_COUNT + 1):
            self.assertContains(response, f"Test Project {i}")

        # assert
        self.assertIsNotNone(results)
        self.assertEqual(len(results), INITIAL_PROJECT_COUNT)

    @tag("sectors", "projects")
    def test_get_projects_lists_content_filtered_by_a_single_sector(self):
        # arranging
        sectors = [
            Sector.objects.create(
                name=f"Test Sector Name {i}",
                name_de_translation=f"Test Sector Name {i} DE",
                key=f"test_sector_{i}",
            )
            for i in range(3)
        ]

        projects = self.projects

        # testing size >1, =1 and =0 for the result length
        ProjectSectorMapping.objects.create(sector=sectors[0], project=projects[0])
        ProjectSectorMapping.objects.create(sector=sectors[0], project=projects[1])
        ProjectSectorMapping.objects.create(sector=sectors[1], project=projects[2])
        # sector 3 will not be used for this test

        # act
        response_1 = self.client.get(self.url + "?sector=" + sectors[0].key)
        response_2 = self.client.get(self.url + "?sector=" + sectors[1].key)
        response_3 = self.client.get(self.url + "?sector=" + sectors[2].key)

        results_1 = response_1.json().get("results", None)
        results_2 = response_2.json().get("results", None)
        results_3 = response_3.json().get("results", None)

        # assert
        self.assertIsNotNone(results_1)
        self.assertEqual(len(results_1), 2)
        self.assertContains(response_1, f"Test Project {1}")
        self.assertContains(response_1, f"Test Project {2}")

        self.assertIsNotNone(results_2)
        self.assertEqual(len(results_2), 1)
        self.assertContains(response_2, f"Test Project {3}")

        self.assertIsNotNone(results_3)
        self.assertEqual(len(results_3), 0)


class TestCreateProjectsViews(APITestCase):
    # -----------------------------------------------------
    # setUp code for each test
    def setUp(self):
        self.url = reverse("organization:create-project-api")

        projectStatus_active = ProjectStatus.objects.create(
            name="active",
            name_de_translation="aktiv",
            has_end_date=False,
            has_start_date=False,
        )

        self.proejcts = [
            Project.objects.create(
                name=f"Test Project {i}",
                description=f"Test Project {i} Description",
                url_slug=f"test-project-{i}",
                is_active=True,
                status=projectStatus_active,
            )
            for i in range(1, INITIAL_PROJECT_COUNT + 1)
        ]

        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
        )

        Location.objects.create(
            name="Test Location", city="Berlin", country="Germany", place_id=1
        )

        self.default_language = Language.objects.create(
            name="Test English",
            native_name="English",
            language_code="en",
        )

        self.default_location_data = {
            "place_id": 1,
            "country": "Germany",
            "name": "Test Location",
            "type": "type",
            "lon": 13.4050,
            "lat": 52.5200,
        }
        # create a dummy black image
        image = Image.new("RGB", (10, 10), "black")
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        self.image = "data:image/png;base64," + b64encode(buffered.getvalue()).decode(
            "utf-8"
        )

        # TODO: broooooo, why -__-
        # we need to change the api asap to just accept the 'project_type'
        # and not the whole object ...
        self.default_project_type_data = {
            "name": "Project",
            "original_name": "Project",
            "help_text": "Not an Idea or Event? Click here.",
            "icon": "",
            "type_id": "project",
        }

        self.default_project_data = {
            "name": "Test Project",
            "project_type": ProjectTypesChoices.project,
            "status": ProjectStatus.objects.first().id,
            "short_description": "Test Project Short Description",
            "collaborators_welcome": True,
            "team_members": [],
            "description": "Test Project Description",
            "url_slug": "test-project",
            "project_tags": [],
            "loc": self.default_location_data,
            "image": self.image,
            "source_language": self.default_language.language_code,
            "translations": {},
            "project_type": self.default_project_type_data,
            "hubName": "null",
        }

        # creating dummy sectors

        self.sectors = [
            Sector.objects.create(
                name=f"Test Sector Name {i}",
                name_de_translation=f"Test Sector Name {i} DE",
                key=f"test_sector_{i}",
            )
            for i in range(3)
        ]

    def test_post_project_declines_if_not_authenticated(self):
        # arrange
        # data = {
        #     "name": "Test Project",
        #     "description": "Test Project Description",
        #     "url_slug": "test-project",
        #     "is_active": True,
        #     "status": 1,
        # }

        # act
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("projects")
    def test_post_project_without_sector(self):
        # arrange
        client = APIClient()
        client.login(username=self.user.username, password=self.user.password)

        # act
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # TODO: check that no sectors are linked to the project
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.default_project_data["url_slug"]
            ).count(),
            0,
        )
        pass

    @tag("sectors", "projects")
    def test_post_project_with_one_sector_as_array(self):
        # arrange
        client = APIClient()
        client.login(username=self.user.username, password=self.user.password)

        self.default_project_data["sectors"] = [self.sectors[0].key]

        # act
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.default_project_data["url_slug"]
            ).count(),
            1,
        )

        pass

    @tag("sectors", "projects")
    def test_post_project_with_one_sector_as_string(self):
        # arrange
        client = APIClient()
        client.login(username=self.user.username, password=self.user.password)

        self.default_project_data["sectors"] = self.sectors[0].key

        # act
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.default_project_data["url_slug"]
            ).count(),
            1,
        )

        pass

    @tag("sectors", "projects")
    def test_post_project_with_two_sector_list(self):
        # arrange
        client = APIClient()
        client.login(username=self.user.username, password=self.user.password)

        self.default_project_data["sectors"] = [
            self.sectors[0].key,
            self.sectors[1].key,
        ]

        # act
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.default_project_data["url_slug"]
            ).count(),
            2,
        )

        pass

    @tag("sectors", "projects")
    def test_post_project_with_two_sector_comma_seperated(self):
        # arrange
        client = APIClient()
        client.login(username=self.user.username, password=self.user.password)

        self.default_project_data["sectors"] = (
            f"{self.sectors[0].key},{self.sectors[1].key}"
        )

        # act
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.default_project_data["url_slug"]
            ).count(),
            2,
        )

        pass

    @tag("sectors", "projects")
    def test_post_project_with_two_sector_dublicated(self):
        # arrange
        client = APIClient()
        client.login(username=self.user.username, password=self.user.password)

        self.default_project_data["sectors"] = (
            f"{self.sectors[0].key},{self.sectors[0].key}"
        )

        # act
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.default_project_data["url_slug"]
            ).count(),
            1,
        )

        pass
