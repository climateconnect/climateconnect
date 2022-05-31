from rest_framework.test import APITestCase
from rest_framework import status
from django.test import TestCase
from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from django.conf import settings

from climateconnect_api.factories import (
    HubFactory,
    LanguageFactory,
    LocationFactory,
    UserFactory,
    UserProfileFactory,
)
from climateconnect_api.tasks import (
    fetch_entities_for_weekly_recommendations,
    fetch_user_info_for_weekly_recommendations,
    process_user_info_and_send_weekly_recommendations,
)
from climateconnect_api.tests.create_test_data import (
    create_project_test_data,
    create_org_test_data,
    create_idea_test_data,
)
from climateconnect_api.utility.email_setup.weekly_recommendations_setup import (
    create_global_variables_for_weekly_recommendations,
)
from climateconnect_api.models.language import Language
from hubs.models.hub import Hub
from location.models import Location


class TestUserLoginView(APITestCase):
    def setUp(self):
        self.user = UserFactory(username="test_user", password="testing2020")

    def test_successful_login_api(self):
        url = reverse("login-api")
        data = {"username": "test_user", "password": "testing@2020"}
        response = self.client.post(url, data, format="json")
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
            "email": "test@testovich.com",
            "password": "testing@2020",
            "first_name": "Climate",
            "last_name": "Tester",
            "country": "Germany",
            "state": "Berlin",
            "City": "Berlin",
        }

        response = self.client.post(url, data, format="json")
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


class TestRecommendedEmail(TestCase):
    # test the recommended email feature
    # unit test for generation of project ids, org ids and idea ids
    # unit test for generation of user ids

    # this function is called once before any test functions are run; the setUp function is called before every test function
    @classmethod
    def setUpTestData(cls):
        # ****** languages ******
        english_language = LanguageFactory(
            name="english", native_name="english", language_code="en", currency="$"
        )
        german_language = LanguageFactory(
            name="german", native_name="Deutsch", language_code="de", currency="€"
        )

        # ****** locations ******
        cls.location_1 = LocationFactory()
        cls.location_2 = LocationFactory()
        cls.location_3 = LocationFactory()

        # ****** hubs ******
        hub_1 = HubFactory(hub_type=Hub.LOCATION_HUB_TYPE, location=[cls.location_1])
        hub_2 = HubFactory(hub_type=Hub.LOCATION_HUB_TYPE, location=[cls.location_2])

        # ****** UserProfiles ******
        cls.english_user_in_hub_1 = UserProfileFactory(
            language=english_language, location=cls.location_1
        )
        cls.english_user_in_hub_2 = UserProfileFactory(
            language=english_language, location=cls.location_2
        )
        cls.german_user_in_hub_1 = UserProfileFactory(
            language=german_language, location=cls.location_1
        )
        cls.german_user_in_hub_2 = UserProfileFactory(
            language=german_language, location=cls.location_2
        )
        cls.english_user_no_hub = UserProfileFactory(language=english_language)
        cls.german_user_no_hub = UserProfileFactory(language=german_language)
        cls.no_language_user_in_hub_1 = UserProfileFactory(location=cls.location_1)
        cls.no_language_user_no_hub = UserProfileFactory()
        cls.english_user_in_hub_1_no_newsletter = UserProfileFactory(
            language=english_language, location=cls.location_1, send_newsletter=False
        )

        # ****** projects ******
        cls.project_in_hub_1_3likes = create_project_test_data(
            number_of_likes=3,
            location=cls.location_1,
            translation_language=german_language,
            has_parent_organization=True,
        )
        cls.project_in_hub_2_2likes = create_project_test_data(
            number_of_likes=2,
            location=cls.location_2,
            translation_language=german_language,
        )
        cls.project_in_hub_2_1likes = create_project_test_data(
            number_of_likes=1,
            location=cls.location_2,
            translation_language=german_language,
            has_parent_organization=True,
        )
        cls.project_in_hub_1_1likes = create_project_test_data(
            number_of_likes=1,
            location=cls.location_1,
            translation_language=german_language,
        )
        cls.project_outside_of_timespan = create_project_test_data(
            number_of_likes=5,
            location=cls.location_1,
            translation_language=german_language,
            created_outside_of_timespan=True,
        )
        cls.project_no_hub_4likes = create_project_test_data(
            number_of_likes=4,
            translation_language=german_language,
            has_parent_organization=True,
        )
        cls.project_no_hub_0likes = create_project_test_data(
            number_of_likes=0,
            translation_language=german_language,
        )

        # ****** organizations ******
        cls.org_in_hub_1 = create_org_test_data(
            location=cls.location_1, translation_language=german_language
        )
        cls.org_in_hub_2 = create_org_test_data(
            location=cls.location_2, translation_language=german_language
        )
        cls.org_no_hub = create_org_test_data(
            location=cls.location_3, translation_language=german_language
        )
        cls.org_in_hub_1_outside_of_timespan = create_org_test_data(
            location=cls.location_1, created_outside_of_timespan=True
        )

        # ****** ideas ******
        cls.idea_in_hub_1 = create_idea_test_data(
            location=cls.location_1, hub=hub_1, translation_language=german_language
        )
        cls.idea_in_hub_2_outside_of_timespan = create_idea_test_data(
            location=cls.location_2, hub=hub_2, created_outside_of_timespan=True
        )

    def test_entities_in_hub1(self):
        """This function tests the function fetch_entities_for_weekly_recommendations()"""
        max_entities = 3
        timespan_start = timezone.now() - timedelta(days=7)
        is_in_hub = True

        # fetch entities in hub 1
        result = fetch_entities_for_weekly_recommendations(
            max_entities, timespan_start, self.location_1.id, is_in_hub
        )
        expected_result = {
            "project": [self.project_in_hub_1_3likes.id],
            "organization": [self.org_in_hub_1.id],
            "idea": [self.idea_in_hub_1.id],
        }
        self.assertEqual(result, expected_result)

    def test_entities_in_hub2(self):
        """This function tests the function fetch_entities_for_weekly_recommendations()"""
        max_entities = 3
        timespan_start = timezone.now() - timedelta(days=7)
        is_in_hub = True

        # fetch entities in hub 2
        result = fetch_entities_for_weekly_recommendations(
            max_entities, timespan_start, self.location_2.id, is_in_hub
        )
        expected_result = {
            "project": [
                self.project_in_hub_2_2likes.id,
                self.project_in_hub_2_1likes.id,
            ],
            "organization": [self.org_in_hub_2.id],
            "idea": [],
        }
        self.assertEqual(result, expected_result)

    def test_entities_no_hub(self):
        """This function tests the function fetch_entities_for_weekly_recommendations()"""
        max_entities = 3
        timespan_start = timezone.now() - timedelta(days=7)

        # fetch international entities
        is_in_hub = False
        no_location = 0
        result = fetch_entities_for_weekly_recommendations(
            max_entities, timespan_start, no_location, is_in_hub
        )
        expected_result = {
            "project": [self.project_no_hub_4likes.id, self.project_in_hub_1_3likes.id],
            "organization": [self.org_no_hub.id],
            "idea": [],
        }
        self.assertEqual(result, expected_result)

    def test_user_data_for_hub1(self):
        """This function tests fetch_user_info_for_weekly_recommendations()"""
        # for hub_1
        result = {}
        is_in_hub = True
        result_queries = fetch_user_info_for_weekly_recommendations(
            self.location_1.id, is_in_hub
        )
        expected_result = {
            "en": [self.english_user_in_hub_1.id, self.no_language_user_in_hub_1.id],
            "de": [self.german_user_in_hub_1.id],
        }
        # the function gives back a dict with lang_code as key and a query as value
        # the query needs to be evaluated first
        for key_result, result_query in result_queries.items():
            result[key_result] = list(result_query)
        self.assertCountEqual(result.items(), expected_result.items())

    def test_user_data_for_hub2(self):
        """This function tests fetch_user_info_for_weekly_recommendations()"""
        # for hub_2
        result = {}
        is_in_hub = True

        result = fetch_user_info_for_weekly_recommendations(
            self.location_2.id, is_in_hub
        )
        expected_result = {
            "en": [self.english_user_in_hub_2.id],
            "de": [self.german_user_in_hub_2.id],
        }
        # the function gives back a dict with lang_code as key and a query as value
        # the query needs to be evaluated first
        for key_result, result_query in result.items():
            result[key_result] = list(result_query)
        self.assertCountEqual(result.items(), expected_result.items())

    def test_user_data_for_no_hub(self):
        """This function tests fetch_user_info_for_weekly_recommendations()"""
        # for international
        result = {}
        is_in_hub = False
        # location_id is 0 for international
        loc = 0
        result = fetch_user_info_for_weekly_recommendations(loc, is_in_hub)
        expected_result = {
            "en": [self.english_user_no_hub.id, self.no_language_user_no_hub.id],
            "de": [self.german_user_no_hub.id],
        }
        # the function gives back a dict with lang_code as key and a query as value
        # the query needs to be evaluated first
        for key_result, result_query in result.items():
            result[key_result] = list(result_query)
        self.assertCountEqual(result, expected_result)
