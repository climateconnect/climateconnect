from rest_framework.test import APITestCase
from rest_framework import status
import unittest

from django.contrib.auth.models import User

from django.urls import reverse
from django.test import tag

from hubs.models.hub import Hub
from climateconnect_api.models import Role, Language
from organization.models import (
    Sector,
    Project,
    ProjectStatus,
    ProjectSectorMapping,
    ProjectMember,
)
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
        # sector 3 will not be connected to any project

        # act
        response_1 = self.client.get(self.url + "?sectors=" + sectors[0].name)
        response_2 = self.client.get(self.url + "?sectors=" + sectors[1].name)
        response_3 = self.client.get(self.url + "?sectors=" + sectors[2].name)

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

    @tag("sectors", "projects")
    def test_get_projects_lists_content_filtered_by_two_sectors(self):
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

        ProjectSectorMapping.objects.create(sector=sectors[0], project=projects[0])
        ProjectSectorMapping.objects.create(sector=sectors[0], project=projects[1])
        ProjectSectorMapping.objects.create(sector=sectors[1], project=projects[2])

        testcases = [
            {
                "url": "sectors={},{}".format(sectors[0].name, sectors[1].name),
                "expected": [
                    projects[0].url_slug,
                    projects[1].url_slug,
                    projects[2].url_slug,
                ],
            },
            {
                "url": "sectors={},{}".format(sectors[0].name, sectors[2].name),
                "expected": [
                    projects[0].url_slug,
                    projects[1].url_slug,
                ],
            },
            {
                "url": "sectors={},{}".format(sectors[1].name, sectors[2].name),
                "expected": [
                    projects[2].url_slug,
                ],
            },
        ]

        # act
        responses = [
            self.client.get(self.url + "?" + testcase["url"]) for testcase in testcases
        ]

        # assert
        for i, response in enumerate(responses):
            results = response.json().get("results", None)

            self.assertIsNotNone(results)
            self.assertEqual(len(results), len(testcases[i]["expected"]))

            for project_slug in testcases[i]["expected"]:
                self.assertContains(response, project_slug)

    @tag("sectors", "projects")
    def test_get_projects_lists_content_filtered_by_sector_hub(self):
        # arrange
        sectors = [
            Sector.objects.create(
                name=f"Test Sector Name {i}",
                name_de_translation=f"Test Sector Name {i} DE",
                key=f"test_sector_{i}",
            )
            for i in range(3)
        ]

        projects = self.projects
        ## mapping projects to sectors
        ## testing number of projects per sector: 2, 1 and 0 (testing a loop)
        ProjectSectorMapping.objects.create(sector=sectors[0], project=projects[0])
        ProjectSectorMapping.objects.create(sector=sectors[0], project=projects[1])
        ProjectSectorMapping.objects.create(sector=sectors[1], project=projects[2])

        # linking sectors to sector hubs, to query projects by sector hubs
        self.sector_hubs = [
            Hub.objects.create(
                name="Test sector Hub {}".format(i),
                url_slug="test-hub-{}".format(i),
                hub_type=Hub.SECTOR_HUB_TYPE,
            )
            for i in range(3)
        ]
        for i in range(3):
            self.sector_hubs[i].sectors.add(sectors[i])

        self.decoy_hub = Hub.objects.create(
            name="Decoy Hub",
            url_slug="decoy-hub",
            hub_type=Hub.LOCATION_HUB_TYPE,
        )

        testcases = [
            # test query by a single sector hub
            {
                "url": "hub={}".format(self.sector_hubs[0].url_slug),
                "expected": [
                    projects[0].url_slug,
                    projects[1].url_slug,
                ],
            },
            {
                "url": "hub={}".format(self.sector_hubs[1].url_slug),
                "expected": [
                    projects[2].url_slug,
                ],
            },
            {
                "url": "hub={}".format(self.sector_hubs[2].url_slug),
                "expected": [],
            },
            {
                "url": "hub={}".format(self.decoy_hub.url_slug),
                "expected": [],
            },
        ]

        # act
        responses = [
            self.client.get(self.url + "?" + testcases[i]["url"]) for i in range(3)
        ]

        # assert
        for i, response in enumerate(responses):
            results = response.json().get("results", None)

            self.assertIsNotNone(results)
            self.assertEqual(len(results), len(testcases[i]["expected"]))

            for project_slug in testcases[i]["expected"]:
                self.assertContains(response, project_slug)
        pass

    @tag("sectors", "projects")
    def test_get_project_sector_ordering(self):
        # arrange
        sectors = [
            Sector.objects.create(
                name=f"Test Sector Name {i}",
                name_de_translation=f"Test Sector Name {i} DE",
                key=f"test_sector_{i}",
            )
            for i in range(3)
        ]

        projects = self.projects
        ## mapping projects to sectors
        ## Setup orderings for sector 0
        ordering_0 = [
            (0, 1),
            (1, 2),
            (2, 3),
        ]
        for x, y in ordering_0:
            ProjectSectorMapping.objects.create(
                project=projects[0], sector=sectors[x], order=y
            )

        ## Setup orderings for sector 1
        ordering_1 = [
            (2, 1),
            (1, 2),
            (0, 3),
        ]
        for x, y in ordering_1:
            ProjectSectorMapping.objects.create(
                project=projects[1], sector=sectors[x], order=y
            )

        # act
        response = self.client.get(self.url + "?sectors=" + sectors[0].name)
        result = response.json().get("results", None)
        self.assertIsNotNone(result)

        project_0 = None
        project_1 = None

        for _project in result:
            if _project["url_slug"] == self.projects[0].url_slug:
                project_0 = _project
            if _project["url_slug"] == self.projects[1].url_slug:
                project_1 = _project

        # assert
        self.assertIsNotNone(project_0)
        self.assertIsNotNone(project_1)

        sectors_0 = project_0.get("sectors", None)
        sectors_1 = project_1.get("sectors", None)

        self.assertIsNotNone(sectors_0)
        self.assertIsNotNone(sectors_1)

        self.assertEqual(len(sectors_0), 3)
        self.assertEqual(len(sectors_1), 3)

        for i, (x, y) in enumerate(ordering_0):
            self.assertEqual(
                sectors_0[i]["sector"]["key"],
                sectors[x].key,
            )
            self.assertEqual(sectors_0[i]["order"], y)

        for i, (x, y) in enumerate(ordering_1):
            self.assertEqual(sectors_1[i]["sector"]["key"], sectors[x].key)
            self.assertEqual(sectors_1[i]["order"], y)


@unittest.skip("Temporarily disabled: see CI failure #57660401767")
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

        # act
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("projects")
    def test_post_project_without_sector(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        # act
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
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
        self.client.login(username="testuser", password="testpassword")

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
        self.client.login(username="testuser", password="testpassword")
        self.default_project_data["sectors"] = self.sectors[0].key

        # act
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
        self.client.login(username="testuser", password="testpassword")

        self.default_project_data["sectors"] = [
            self.sectors[0].key,
            self.sectors[1].key,
        ]

        # act
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
        self.client.login(username="testuser", password="testpassword")

        self.default_project_data["sectors"] = (
            f"{self.sectors[0].key},{self.sectors[1].key}"
        )

        # act
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
        self.client.login(username="testuser", password="testpassword")

        self.default_project_data["sectors"] = (
            f"{self.sectors[0].key},{self.sectors[0].key}"
        )

        # act
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
    def test_post_project_with_sectors_will_keep_the_correct_ordering(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.default_project_data["sectors"] = ",".join([s.key for s in self.sectors])

        # act
        response = self.client.post(self.url, self.default_project_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mappings = ProjectSectorMapping.objects.filter(
            project__url_slug=self.default_project_data["url_slug"]
        )
        self.assertEqual(len(self.sectors), mappings.count())
        n = len(self.sectors)
        for i, mapping in enumerate(mappings):
            expected_order = n - i
            self.assertEqual(expected_order, mapping.order)
        pass


class TestProjectApi(APITestCase):

    def setUp(self):
        self.url_slug = "test-project"
        self.url = reverse(
            "organization:project-api-view", kwargs={"url_slug": "test-project"}
        )
        self.edit_view_url = self.url + "?" + "edit_view"

        self.projectStatus_active = ProjectStatus.objects.create(
            name="active",
            name_de_translation="aktiv",
            has_end_date=False,
            has_start_date=False,
        )

        self.default_language = Language.objects.create(
            name="Test English",
            native_name="English",
            language_code="en",
        )

        self.project = Project.objects.create(
            name="Test Project",
            description="Test Project Description",
            url_slug=self.url_slug,
            is_active=True,
            status=self.projectStatus_active,
            language=self.default_language,
        )

        self.decoy_project = Project.objects.create(
            name="decoy",
            description="decoy desc",
            url_slug="decoy",
            is_active=True,
            status=self.projectStatus_active,
        )

        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
        )

        self.role = Role.objects.create(
            name="Admin",
            role_type=Role.ALL_TYPE,
        )
        ProjectMember.objects.create(
            user=self.user,
            project=self.project,
            role=self.role,
        )

    @tag("projects")
    def test_get_project_by_url_slug(self):
        # arrange

        # act
        response = self.client.get(self.url)
        res = response.json()

        # assert
        self.assertIsNotNone(res)
        self.assertContains(response, "Test Project")
        self.assertNotContains(response, "decoy")

    @tag("sectors", "projects")
    def test_get_project_by_url_slug_includes_sector(self):
        # arrange
        self.sector = Sector.objects.create(
            name="Test Sector",
            name_de_translation="Test Sector DE",
            key="test_sector",
        )
        self.sector_decoy = Sector.objects.create(
            name="Test Sector decoy",
            name_de_translation="Test Sector DE decoy",
            key="test_sector_decoy",
        )

        ProjectSectorMapping.objects.create(sector=self.sector, project=self.project)
        ProjectSectorMapping.objects.create(
            sector=self.sector_decoy, project=self.decoy_project
        )

        # act
        response = self.client.get(self.url)
        res = response.json()

        # assert
        self.assertIsNotNone(res)
        self.assertContains(response, "Test Project")
        self.assertContains(response, "Test Sector")
        self.assertNotContains(response, "decoy")

    @tag("sectors", "projects")
    def test_get_project_edit_view_by_url_slug_includes_sector(self):
        # arrange
        self.sector = Sector.objects.create(
            name="Test Sector",
            name_de_translation="Test Sector DE",
            key="test_sector",
        )
        self.sector_decoy = Sector.objects.create(
            name="Test Sector decoy",
            name_de_translation="Test Sector DE decoy",
            key="test_sector_decoy",
        )

        ProjectSectorMapping.objects.create(sector=self.sector, project=self.project)
        ProjectSectorMapping.objects.create(
            sector=self.sector_decoy, project=self.decoy_project
        )

        # act
        response = self.client.get(self.edit_view_url)
        res = response.json()

        # assert
        self.assertIsNotNone(res)
        self.assertContains(response, "Test Project")
        self.assertContains(response, "Test Sector")
        self.assertNotContains(response, "decoy")

    @tag("sectors", "projects")
    def test_get_project_by_url_slug_includes_sector_correctly_sorted(self):
        # arrange
        N = 4
        self.sectors = [
            Sector.objects.create(
                name=f"Test Sector{i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(N)
        ]
        ordering = {self.sectors[i].key: i + 1 for i in range(N)}

        for sector in self.sectors:
            ProjectSectorMapping.objects.create(
                sector=sector, project=self.project, order=ordering[sector.key]
            )

        # act
        response = self.client.get(self.url)
        res_view = response.json().get("sectors", None)

        response_edit = self.client.get(self.edit_view_url)
        res_edit = response_edit.json().get("sectors", None)

        # assert
        ## perform it for both results, as the ordering should be the same on both views
        for res in [res_view, res_edit]:
            self.assertIsNotNone(res)
            for item in res:
                sector = item.get("sector", None)
                order = item.get("order", None)

                self.assertIsNotNone(sector)
                self.assertIsNotNone(order)

                key = sector["key"]
                order = int(order)
                expected_order = ordering[key]

                self.assertIsNotNone(expected_order)
                self.assertEqual(order, expected_order)

    @tag("sectors", "projects")
    def test_patch_project_adding_first_sector(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.sector = Sector.objects.create(
            name="Test Sector",
            name_de_translation="Test Sector DE",
            key="test_sector",
        )

        data = {
            "sectors": [self.sector.key],
        }

        # act
        self.client.patch(self.url, data, format="json")
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug
            ).count(),
            1,
        )
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug, sector__key=self.sector.key
            ).count(),
            1,
        )

    @tag("sectors", "projects")
    def test_patch_project_adding_another_sectors(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.sectors = [
            Sector.objects.create(
                name=f"Test Sector {i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(2)
        ]
        ProjectSectorMapping.objects.create(
            sector=self.sectors[0], project=self.project
        )

        data = {
            "sectors": [self.sectors[0].key, self.sectors[1].key],
        }

        # act
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug
            ).count(),
            2,
        )
        for sector in self.sectors:
            self.assertEqual(
                ProjectSectorMapping.objects.filter(
                    project__url_slug=self.project.url_slug, sector__key=sector.key
                ).count(),
                1,
            )

    @tag("sectors", "projects")
    def test_patch_project_adding_multiple_sectors(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        ## set up another project with the same user as an admin
        self.other_project = Project.objects.create(
            name="Other Project",
            description="Other Project Description",
            url_slug="other-project",
            is_active=True,
            status=self.projectStatus_active,
            language=self.default_language,
        )
        self.other_url = self.url.replace(
            self.project.url_slug, self.other_project.url_slug
        )
        ProjectMember.objects.create(
            user=self.user,
            project=self.other_project,
            role=self.role,
        )

        self.sectors = [
            Sector.objects.create(
                name=f"Test Sector {i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(4)
        ]
        ProjectSectorMapping.objects.create(
            sector=self.sectors[0], project=self.other_project
        )
        ProjectSectorMapping.objects.create(
            sector=self.sectors[3], project=self.decoy_project
        )

        data = {
            "sectors": [
                self.sectors[0].key,
                self.sectors[1].key,
                self.sectors[2].key,
            ],
        }
        data_other = {
            "sectors": [
                self.sectors[0].key,
                self.sectors[1].key,
                self.sectors[3].key,
            ],
        }

        # act
        response = self.client.patch(self.url, data, format="json")
        response_other = self.client.patch(self.other_url, data_other, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertContains(response_other, "successfully updated")

        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug
            ).count(),
            3,
        )
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.other_project.url_slug
            ).count(),
            3,
        )

        for sector in self.sectors[:3]:
            self.assertEqual(
                ProjectSectorMapping.objects.filter(
                    project__url_slug=self.project.url_slug, sector__key=sector.key
                ).count(),
                1,
            )

        for sector in [self.sectors[0], self.sectors[1], self.sectors[3]]:
            self.assertEqual(
                ProjectSectorMapping.objects.filter(
                    project__url_slug=self.other_project.url_slug,
                    sector__key=sector.key,
                ).count(),
                1,
            )

    @tag("sectors", "projects")
    def test_patch_project_removing_sector(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.sector = Sector.objects.create(
            name="Test Sector",
            name_de_translation="Test Sector DE",
            key="test_sector",
        )
        ProjectSectorMapping.objects.create(sector=self.sector, project=self.project)

        data = {
            "sectors": [],
        }

        # act
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug
            ).count(),
            0,
        )

    @tag("sectors", "projects")
    def test_patch_project_ordering_of_sectors_correctly_assigned(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.sectors = [
            Sector.objects.create(
                name=f"Test Sector {i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(4)
        ]
        ProjectSectorMapping.objects.create(
            sector=self.sectors[0], project=self.project, order=1
        )

        data = {
            "sectors": [self.sectors[3].key, self.sectors[2].key, self.sectors[1].key]
        }

        # act
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug
            ).count(),
            3,
        )

        for i, sector in enumerate(self.sectors[1:]):
            mappings = ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug, sector__key=sector.key
            )
            self.assertEqual(mappings.count(), 1)
            mapping = mappings[0]
            self.assertEqual(mapping.order, i + 1)

    @tag("sectors", "projects")
    def test_patch_project_reordering_of_sectors(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        N = 4
        self.sectors = [
            Sector.objects.create(
                name=f"Test Sector {i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(N)
        ]

        for i, sector in enumerate(self.sectors):
            ProjectSectorMapping.objects.create(
                sector=sector, project=self.project, order=i
            )

        data = {
            "sectors": [self.sectors[N - i - 1].key for i in range(N)]
            + [s.key for s in self.sectors],
        }

        # act
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug
            ).count(),
            N,
        )

        for i, sector in enumerate(self.sectors):
            mapping = ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug, sector__key=sector.key
            ).first()
            self.assertEqual(mapping.order, i + 1)

    @tag("sectors", "projects")
    def test_delete_project_sector(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")
        self.sector = Sector.objects.create(
            name="Test Sector",
            name_de_translation="Test Sector DE",
            key="test_sector",
        )
        ProjectSectorMapping.objects.create(sector=self.sector, project=self.project)
        data = {
            "sectors": [],
        }

        # act
        response = self.client.delete(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully deleted")
        self.assertEqual(
            ProjectSectorMapping.objects.filter(
                project__url_slug=self.project.url_slug
            ).count(),
            0,
        )
