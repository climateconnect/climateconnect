from rest_framework.test import APITestCase

from django.urls import reverse
from django.test import tag

from rest_framework import status

from django.contrib.auth.models import User
from climateconnect_api.models.language import Language
from location.models import Location
from organization.models import (
    Sector,
    Organization,
    OrganizationSectorMapping,
)
from hubs.models import Hub


from PIL import Image
from base64 import b64encode
import io

NUMBER_OF_ORGANIZATIONS = 5


class TestListOrganizationsAPIView(APITestCase):
    # test get (no selectors [0])
    # test get (select hub [1, 2])
    # test get (select sector hub [1, 2])
    # test get (select sector [1, 2])
    # test get (select sector [(1,1), (2,2)] )

    def setUp(self):
        self.url = reverse("organization:list-organizations-api-view")
        self.organizations = [
            Organization.objects.create(
                name=f"Test Organization {i}",
                url_slug=f"test-organization-{i}",
            )
            for i in range(NUMBER_OF_ORGANIZATIONS)
        ]
        # self.user =

    @tag("organizations")
    def test_get_organizations(self):
        # arrange

        # act
        response = self.client.get(self.url)
        res = response.json()

        data = res.get("results", [])

        # assert
        self.assertIsNotNone(res)
        self.assertEqual(len(data), NUMBER_OF_ORGANIZATIONS)

    @tag("organizations", "sectors")
    def test_get_organizations_filtered_by_sector(self):
        # arrange
        self.sectors = [
            Sector.objects.create(
                name=f"Test Sector Name {i}",
                name_de_translation=f"Test Sector Name {i} DE",
                key=f"test_sector_{i}",
            )
            for i in range(3)
        ]

        # testing >1, =1 and no sector
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[0],
            sector=self.sectors[0],
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[1],
            sector=self.sectors[0],
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[2],
            sector=self.sectors[1],
        )

        # act
        response_1 = self.client.get(self.url + "?sectors=" + self.sectors[0].key)
        response_2 = self.client.get(self.url + "?sectors=" + self.sectors[1].key)
        response_3 = self.client.get(self.url + "?sectors=" + self.sectors[2].key)

        results_1 = response_1.json().get("results", None)
        results_2 = response_2.json().get("results", None)
        results_3 = response_3.json().get("results", None)

        # assert
        self.assertIsNotNone(results_1)
        self.assertEqual(len(results_1), 2)
        self.assertContains(response_1, f"Test Organization {0}")
        self.assertContains(response_1, f"Test Organization {1}")

        self.assertIsNotNone(results_2)
        self.assertEqual(len(results_2), 1)
        self.assertContains(response_2, f"Test Organization {2}")

        self.assertIsNotNone(results_3)
        self.assertEqual(len(results_3), 0)

    @tag("organizations", "sectors")
    def test_get_organizations_filtered_by_two_sectors(self):
        # arrange
        self.sectors = [
            Sector.objects.create(
                name=f"Test Sector Name {i}",
                name_de_translation=f"Test Sector Name {i} DE",
                key=f"test_sector_{i}",
            )
            for i in range(3)
        ]

        # testing >1, =1 and no sector
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[0],
            sector=self.sectors[0],
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[1],
            sector=self.sectors[0],
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[2],
            sector=self.sectors[1],
        )

        testcases = [
            {
                "url": "sectors={},{}".format(self.sectors[0].key, self.sectors[1].key),
                "expected": [
                    self.organizations[0].url_slug,
                    self.organizations[1].url_slug,
                    self.organizations[2].url_slug,
                ],
            },
            {
                "url": "sectors={},{}".format(self.sectors[0].key, self.sectors[2].key),
                "expected": [
                    self.organizations[0].url_slug,
                    self.organizations[1].url_slug,
                ],
            },
            {
                "url": "sectors={},{}".format(self.sectors[1].key, self.sectors[2].key),
                "expected": [
                    self.organizations[2].url_slug,
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

            for slugs in testcases[i]["expected"]:
                self.assertContains(response, slugs)

    @tag("organizations", "hubs", "sectors")
    def test_get_organizations_filtered_by_sector_hub(self):
        # arrange
        self.sector = Sector.objects.create(
            name="Test Sector Hub",
            name_de_translation="Test Sektor Hub DE",
            key="test_sector_hub",
        )

        self.hub = Hub.objects.create(
            name="Test Hub",
            url_slug="test-hub",
            hub_type=Hub.SECTOR_HUB_TYPE,
        )
        self.hub.sectors.add(self.sector)

        OrganizationSectorMapping.objects.create(
            organization=self.organizations[0], sector=self.sector
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[1], sector=self.sector
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[2], sector=self.sector
        )

        # act
        response = self.client.get(self.url + "?hub={}".format(self.hub.url_slug))
        results = response.json().get("results", None)

        # assert
        self.assertIsNotNone(results)
        self.assertEqual(len(results), 3)
        for i, organization in enumerate(self.organizations):
            if i < 3:
                self.assertContains(response, organization.name)
                self.assertContains(response, organization.url_slug)
            else:
                self.assertNotContains(response, organization.name)
                self.assertNotContains(response, organization.url_slug)


class TestCreateOrganizationView(APITestCase):
    def setUp(self):
        self.url_slug = "test-organization"
        self.url = reverse(
            "organization:create-organization-api-view",
        )

        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
        )

        # prepare data
        Language.objects.create(
            name="Test English",
            native_name="English",
            language_code="en",
        )

        self.default_language = Language.objects.create(
            name="Test Deutsch",
            native_name="Deutsch",
            language_code="de",
        )

        Location.objects.create(
            name="Test Location", city="Berlin", country="Germany", place_id=1
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

        self.deafault_organization = {
            "name": "Test Organization",
            "url_slug": self.url_slug,
            "team_members": [],
            "location": self.default_location_data,
            "image": self.image,
            "organization_tags": [],
            "sectors": "",
            "translations": {},
            "source_language": self.default_language.language_code,
            "short_description": "This is a test organization.",
        }

    @tag("organization")
    def test_post_organization_declines_if_not_authenticated(self):
        # arrange

        # act
        response = self.client.post(
            self.url, data=self.deafault_organization, format="json"
        )

        # assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("organization")
    def test_post_organization_without_sector(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        # act
        response = self.client.post(self.url, self.deafault_organization, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"]
            ).count(),
            0,
        )

    @tag("organization", "sectors")
    def test_post_organization_with_sector_as_array(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.sector = Sector.objects.create(
            name="Test Sector",
            name_de_translation="Test Sektor DE",
            key="test_sector",
        )

        # create a dummy sector
        Sector.objects.create(
            name="Dummy Sector",
            name_de_translation="Dummy Sektor DE",
            key="dummy_sector",
        )

        organization_data = self.deafault_organization
        organization_data["sectors"] = [self.sector.key]

        # act
        response = self.client.post(self.url, data=organization_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
            ).count(),
            1,
        )
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
                sector=self.sector,
            ).count(),
            1,
        )

    @tag("organization", "sectors")
    def test_post_organization_with_sector_as_string(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.sector = Sector.objects.create(
            name="Test Sector",
            name_de_translation="Test Sektor DE",
            key="test_sector",
        )

        # create a dummy sector
        Sector.objects.create(
            name="Dummy Sector",
            name_de_translation="Dummy Sektor DE",
            key="dummy_sector",
        )

        organization_data = self.deafault_organization
        organization_data["sectors"] = self.sector.key

        # act
        response = self.client.post(self.url, data=organization_data, format="json")

        # assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
            ).count(),
            1,
        )
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
                sector=self.sector,
            ).count(),
            1,
        )

    @tag("organization", "sectors")
    def test_post_organization_with_two_sectors_as_array(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.sectors = [
            Sector.objects.create(
                name="Test Sector {}".format(i),
                name_de_translation="Test Sektor DE {}".format(i),
                key="test_sector {}".format(i),
            )
            for i in range(2)
        ]

        # create a dummy sector
        Sector.objects.create(
            name="Dummy Sector",
            name_de_translation="Dummy Sektor DE",
            key="dummy_sector",
        )

        organization_data = self.deafault_organization
        organization_data["sectors"] = [s.key for s in self.sectors]

        # act
        self.client.post(self.url, data=organization_data, format="json")

        # assert
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
            ).count(),
            2,
        )
        for sector in self.sectors:
            self.assertEqual(
                OrganizationSectorMapping.objects.filter(
                    organization__url_slug=self.deafault_organization["url_slug"],
                    sector=sector,
                ).count(),
                1,
            )

    @tag("organization", "sectors")
    def test_post_organization_with_two_sectors_as_string(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        self.sectors = [
            Sector.objects.create(
                name="Test Sector {}".format(i),
                name_de_translation="Test Sektor DE {}".format(i),
                key="test_sector {}".format(i),
            )
            for i in range(2)
        ]

        # create a dummy sector
        Sector.objects.create(
            name="Dummy Sector",
            name_de_translation="Dummy Sektor DE",
            key="dummy_sector",
        )

        organization_data = self.deafault_organization
        organization_data["sectors"] = ",".join([s.key for s in self.sectors])

        # act
        self.client.post(self.url, data=organization_data, format="json")

        # assert
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
            ).count(),
            2,
        )
        for sector in self.sectors:
            self.assertEqual(
                OrganizationSectorMapping.objects.filter(
                    organization__url_slug=self.deafault_organization["url_slug"],
                    sector=sector,
                ).count(),
                1,
            )


class TestOrganizationAPIView(APITestCase):
    # test get & test get edit-view
    # test get & get edit-view (with sector [1, 2])
    # test patch sector ==> check mapping
    def setUp(self):
        self.url_slug = "test-organization"
        self.url = reverse(
            "organization:organization-api-view",
            kwargs={"url_slug": self.url_slug},
        )
