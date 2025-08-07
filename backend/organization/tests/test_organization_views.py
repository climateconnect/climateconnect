from rest_framework.test import APITestCase

from django.urls import reverse
from django.test import tag

from rest_framework import status

from django.contrib.auth.models import User
from climateconnect_api.models import Role, Language, UserProfile
from location.models import Location
from organization.models import (
    Sector,
    Organization,
    OrganizationSectorMapping,
    OrganizationMember,
)
from hubs.models import Hub


from PIL import Image
from base64 import b64encode
import io

NUMBER_OF_ORGANIZATIONS = 5


class TestListOrganizationsAPIView(APITestCase):
    def setUp(self):
        self.url = reverse("organization:list-organizations-api-view")
        self.organizations = [
            Organization.objects.create(
                name=f"Test Organization {i}",
                url_slug=f"test-organization-{i}",
            )
            for i in range(NUMBER_OF_ORGANIZATIONS)
        ]

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
        sectors = [
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
            sector=sectors[0],
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[1],
            sector=sectors[0],
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[2],
            sector=sectors[1],
        )

        # act
        response_1 = self.client.get(self.url + "?sectors=" + sectors[0].key)
        response_2 = self.client.get(self.url + "?sectors=" + sectors[1].key)
        response_3 = self.client.get(self.url + "?sectors=" + sectors[2].key)

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
        sectors = [
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
            sector=sectors[0],
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[1],
            sector=sectors[0],
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[2],
            sector=sectors[1],
        )

        testcases = [
            {
                "url": "sectors={},{}".format(sectors[0].key, sectors[1].key),
                "expected": [
                    self.organizations[0].url_slug,
                    self.organizations[1].url_slug,
                    self.organizations[2].url_slug,
                ],
            },
            {
                "url": "sectors={},{}".format(sectors[0].key, sectors[2].key),
                "expected": [
                    self.organizations[0].url_slug,
                    self.organizations[1].url_slug,
                ],
            },
            {
                "url": "sectors={},{}".format(sectors[1].key, sectors[2].key),
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

    @tag("organizations", "sectors")
    def test_get_organizations_with_correct_ordering(self):
        # arrange
        N = 4
        org = self.organizations[0]
        sectors = [
            Sector.objects.create(
                name=f"Test Sector Name {i}",
                name_de_translation=f"Test Sector Name {i} DE",
                key=f"test_sector_{i}",
            )
            for i in range(4)
        ]
        ordering = {sectors[i].key: i + 1 for i in range(N)}

        for sector in sectors:
            OrganizationSectorMapping.objects.create(
                sector=sector, organization=org, order=ordering[sector.key]
            )

        # act
        response = self.client.get(self.url)
        results = response.json().get("results", None)

        # assert
        self.assertIsNotNone(results)

        ## find the correct org that should be tested
        res_org = None
        for o in results:
            if "url_slug" in o and o["url_slug"] == org.url_slug:
                res_org = o

        self.assertIsNotNone(res_org)

        sectors = res_org.get("sectors", None)
        self.assertIsNotNone(sectors)

        for item in sectors:
            sector = item.get("sector", None)
            order = item.get("order", None)

            self.assertIsNotNone(sector)
            self.assertIsNotNone(order)

            key = sector["key"]
            order = int(order)
            expected_order = ordering[key]

            self.assertIsNotNone(expected_order)
            self.assertEqual(order, expected_order)

    @tag("organizations", "hubs", "sectors")
    def test_get_organizations_filtered_by_sector_hub(self):
        # arrange
        sector = Sector.objects.create(
            name="Test Sector Hub",
            name_de_translation="Test Sektor Hub DE",
            key="test_sector_hub",
        )

        hub = Hub.objects.create(
            name="Test Hub",
            url_slug="test-hub",
            hub_type=Hub.SECTOR_HUB_TYPE,
        )
        hub.sectors.add(sector)

        OrganizationSectorMapping.objects.create(
            organization=self.organizations[0], sector=sector
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[1], sector=sector
        )
        OrganizationSectorMapping.objects.create(
            organization=self.organizations[2], sector=sector
        )

        # act
        response = self.client.get(self.url + "?hub={}".format(hub.url_slug))
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

        sector = Sector.objects.create(
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
        organization_data["sectors"] = [sector.key]

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
                sector=sector,
            ).count(),
            1,
        )

    @tag("organization", "sectors")
    def test_post_organization_with_sector_as_string(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        sector = Sector.objects.create(
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
        organization_data["sectors"] = sector.key

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
                sector=sector,
            ).count(),
            1,
        )

    @tag("organization", "sectors")
    def test_post_organization_with_two_sectors_as_array(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        sectors = [
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
        organization_data["sectors"] = [s.key for s in sectors]

        # act
        self.client.post(self.url, data=organization_data, format="json")

        # assert
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
            ).count(),
            2,
        )
        for sector in sectors:
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

        sectors = [
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
        organization_data["sectors"] = ",".join([s.key for s in sectors])

        # act
        self.client.post(self.url, data=organization_data, format="json")

        # assert
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
            ).count(),
            2,
        )
        for sector in sectors:
            self.assertEqual(
                OrganizationSectorMapping.objects.filter(
                    organization__url_slug=self.deafault_organization["url_slug"],
                    sector=sector,
                ).count(),
                1,
            )

    @tag("organization", "sectors")
    def test_post_organization_with_sectors_correctly_ordered(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        N = 4
        sectors = [
            Sector.objects.create(
                name="Test Sector {}".format(i),
                name_de_translation="Test Sektor DE {}".format(i),
                key="test_sector {}".format(i),
            )
            for i in range(N)
        ]

        organization_data = self.deafault_organization
        organization_data["sectors"] = [s.key for s in sectors]
        ordering = {s.key: len(sectors) - i for i, s in enumerate(sectors)}

        # act
        self.client.post(self.url, data=organization_data, format="json")

        # assert
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
            ).count(),
            N,
        )
        for sector in sectors:
            mapping = OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.deafault_organization["url_slug"],
                sector=sector,
            )
            self.assertEqual(mapping.count(), 1)
            self.assertEqual(mapping.first().order, ordering[sector.key])


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
        self.edit_view_url = self.url + "?" + "edit_view"

        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
            id=1,
        )
        self.user_decoy = User.objects.create_user(
            username="decoy",
            password="decoy",
            id=2,
        )
        UserProfile.objects.create(user=self.user)
        UserProfile.objects.create(user=self.user_decoy)

        self.role = Role.objects.create(
            name="Admin",
            role_type=Role.ALL_TYPE,
        )

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

        self.org = Organization.objects.create(
            name=f"Test Organization",
            url_slug=f"test-organization",
            language=self.default_language,
        )
        self.org_decoy = Organization.objects.create(
            name=f"Decoy Organization",
            url_slug=f"decoy-organization",
            language=self.default_language,
        )

        OrganizationMember.objects.create(
            user=self.user, organization=self.org, role=self.role
        )
        OrganizationMember.objects.create(
            user=self.user_decoy, organization=self.org_decoy, role=self.role
        )

    @tag("organiztaion")
    def test_get_organization_by_url_slug(self):
        # arrange

        # act
        response = self.client.get(self.url)
        res = response.json()

        # assert
        self.assertIsNotNone(res)
        self.assertContains(response, self.org.name)
        self.assertNotContains(response, self.org_decoy.name)
        pass

    @tag("organiztaion", "sectors")
    def test_get_organization_by_url_slug_includes_sectors(self):
        # arrange
        sector = Sector.objects.create(
            name="Test Sector", name_de_translation="Test Sector DE", key="test_sector"
        )
        sector_decoy = Sector.objects.create(
            name="Test Sector decoy",
            name_de_translation="Test Sector DE decoy",
            key="decoy_sector",
        )

        OrganizationSectorMapping.objects.create(sector=sector, organization=self.org)
        OrganizationSectorMapping.objects.create(
            sector=sector_decoy, organization=self.org_decoy
        )

        # act
        response = self.client.get(self.url)
        res = response.json()

        # assert
        self.assertIsNotNone(res)
        self.assertContains(response, self.org.name)
        self.assertContains(response, sector.name)
        self.assertNotContains(response, "decoy")
        pass

    @tag("organiztaion", "sectors")
    def test_get_organization_edit_view_by_url_slug_includes_sectors(self):
        # arrange
        sector = Sector.objects.create(
            name="Test Sector", name_de_translation="Test Sector DE", key="test_sector"
        )
        sector_decoy = Sector.objects.create(
            name="Test Sector decoy",
            name_de_translation="Test Sector DE decoy",
            key="decoy_sector",
        )

        OrganizationSectorMapping.objects.create(sector=sector, organization=self.org)
        OrganizationSectorMapping.objects.create(
            sector=sector_decoy, organization=self.org_decoy
        )

        # act
        response = self.client.get(self.edit_view_url)
        res = response.json()

        # assert
        self.assertIsNotNone(res)
        self.assertContains(response, self.org.name)
        self.assertContains(response, sector.name)
        self.assertNotContains(response, "decoy")
        pass

    @tag("organization", "sectors")
    def test_get_organization_includes_sectors_correctly_ordered(self):
        # arrange
        N = 4
        sectors = [
            Sector.objects.create(
                name=f"Test Sector {i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(N)
        ]
        ordering = {sectors[i].key: N - i for i in range(N)}

        for sector in sectors:
            OrganizationSectorMapping.objects.create(
                sector=sector, organization=self.org, order=ordering[sector.key]
            )
        # act
        response = self.client.get(self.url)
        res_view = response.json().get("sectors", None)

        response_edit = self.client.get(self.edit_view_url)
        res_edit = response_edit.json().get("sectors", None)

        # assert
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

    @tag("organization", "sectors")
    def test_patch_organization_adding_first_sector(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")
        sector = Sector.objects.create(
            name="Test Sector", name_de_translation="Test Sector DE", key="test_sector"
        )
        Sector.objects.create(
            name="Test Sector decoy",
            name_de_translation="Test Sector DE decoy",
            key="decoy_sector",
        )

        data = {"sectors": [sector.key]}

        # act
        self.client.patch(self.url, data, format="json")
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug,
            ).count(),
            1,
        )
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug, sector__key=sector.key
            ).count(),
            1,
        )

    @tag("organization", "sectors")
    def test_patch_organization_adding_multiple_sectors(self):
        self.client.login(username="testuser", password="testpassword")
        sectors = [
            Sector.objects.create(
                name=f"Test Sector {i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(4)
        ]
        Sector.objects.create(
            name="Test Sector decoy",
            name_de_translation="Test Sector DE decoy",
            key="decoy_sector",
        )

        data = {"sectors": [s.key for s in sectors]}

        # act
        self.client.patch(self.url, data, format="json")
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug,
            ).count(),
            len(sectors),
        )
        for s in sectors:
            self.assertEqual(
                OrganizationSectorMapping.objects.filter(
                    organization__url_slug=self.org.url_slug, sector__key=s.key
                ).count(),
                1,
            )

    @tag("organization", "sectors")
    def test_patch_organization_adding_another_sector(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")
        sector = Sector.objects.create(
            name="Test Sector", name_de_translation="Test Sector DE", key="test_sector"
        )
        sector_other = Sector.objects.create(
            name="Test Sector decoy",
            name_de_translation="Test Sector DE decoy",
            key="decoy_sector",
        )

        OrganizationSectorMapping.objects.create(
            organization=self.org, sector=sector_other
        )

        data = {"sectors": [sector.key, sector_other.key]}

        # act
        self.client.patch(self.url, data, format="json")
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug,
            ).count(),
            2,
        )
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug, sector__key=sector.key
            ).count(),
            1,
        )
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug, sector__key=sector_other.key
            ).count(),
            1,
        )

    @tag("organization", "sectors")
    def test_patch_organization_removing_sector(self):
        # TODO:
        # arrange
        self.client.login(username="testuser", password="testpassword")
        sector = Sector.objects.create(
            name="Test Sector", name_de_translation="Test Sector DE", key="test_sector"
        )
        sector_other = Sector.objects.create(
            name="Test Sector decoy",
            name_de_translation="Test Sector DE decoy",
            key="decoy_sector",
        )

        OrganizationSectorMapping.objects.create(organization=self.org, sector=sector)
        OrganizationSectorMapping.objects.create(
            organization=self.org, sector=sector_other
        )
        OrganizationSectorMapping.objects.create(
            organization=self.org_decoy, sector=sector
        )

        data = {"sectors": []}

        # act
        response = self.client.patch(self.url, data, format="json")

        # assert

        self.assertContains(response, "successfully updated")
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug,
            ).count(),
            0,
        )

        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org_decoy.url_slug,
            ).count(),
            1,
        )

        pass

    @tag("organization", "sectors")
    def test_patch_organization_ordering_of_sectors_correctly_assigned(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")
        N = 4
        sectors = [
            Sector.objects.create(
                name=f"Test Sector {i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(N)
        ]

        OrganizationSectorMapping.objects.create(
            organization=self.org, sector=sectors[0], order=1
        )

        ordering = {s.key: N - i - 1 for i, s in enumerate(sectors[1:])}
        data = {"sectors": [s.key for s in sectors[1:]]}

        # act
        self.client.patch(self.url, data, format="json")
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug,
            ).count(),
            3,
        )

        for sector in sectors[1:]:
            mapping = OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug, sector=sector
            )
            self.assertEqual(mapping.count(), 1)
            self.assertEqual(mapping.first().order, ordering[sector.key])

    @tag("organization", "sectors")
    def test_patch_organization_reordering_of_sectors(self):
        # arrange
        self.client.login(username="testuser", password="testpassword")

        N = 4
        sectors = [
            Sector.objects.create(
                name=f"Test Sector {i}",
                name_de_translation=f"Test Sector DE {i}",
                key=f"test_sector_{i}",
            )
            for i in range(N)
        ]
        for i, sector in enumerate(sectors):
            OrganizationSectorMapping.objects.create(
                organization=self.org, sector=sector, order=i + 1
            )
        ordering = {s.key: i + 1 for i, s in enumerate(sectors)}
        data = {"sectors": [s.key for s in sectors]}
        data["sectors"].reverse()
        data["sectors"] += [s.key for s in sectors]  # adding obsolete duplicates

        # act
        self.client.patch(self.url, data, format="json")
        response = self.client.patch(self.url, data, format="json")

        # assert
        self.assertContains(response, "successfully updated")
        self.assertEqual(
            OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug,
            ).count(),
            N,
        )

        for sector in sectors:
            mapping = OrganizationSectorMapping.objects.filter(
                organization__url_slug=self.org.url_slug, sector=sector
            ).first()
            self.assertIsNotNone(mapping)
            self.assertEqual(mapping.order, ordering[sector.key])
