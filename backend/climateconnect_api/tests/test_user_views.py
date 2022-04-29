from rest_framework.test import APITestCase
from rest_framework import status
from django.test import TestCase
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

from climateconnect_api.models.language import Language
from location.models import Location
from climateconnect_api.tests.create_test_data import (
    create_project_test_data,
    create_org_test_data,
    create_idea_test_data,
)

from climateconnect_api.tasks import (
    fetch_entities_for_weekly_recommendations,
    fetch_user_info_for_weekly_recommendations,
    process_user_info_and_send_weekly_recommendations,
    fetch_and_create_globals_for_weekly_recommendations,
)

from django.urls import reverse

from climateconnect_api.factories import (
    HubFactory,
    LanguageFactory,
    LocationFactory,
    UserFactory,
    UserProfileFactory,
)


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
    # test that sends email to MAILJET_ADMIN_EMAIL

    # this function is called once before any test functions are run; the setUp function is called before every test function
    @classmethod
    def setUpTestData(cls):
        english_language = LanguageFactory(
            name="english", native_name="english", language_code="en", currency="$"
        )
        german_language = LanguageFactory(
            name="german", native_name="Deutsch", language_code="de", currency="€"
        )

        cls.location_1 = LocationFactory()
        cls.location_2 = LocationFactory()
        cls.location_3 = LocationFactory()

        hub_1 = HubFactory(hub_type=1, location=[cls.location_1])
        hub_2 = HubFactory(hub_type=1, location=[cls.location_2])

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

        cls.project_in_hub_1_3likes = create_project_test_data(
            number_of_likes=3, location=cls.location_1, has_parent_organization=True
        )
        cls.project_in_hub_2_2likes = create_project_test_data(
            number_of_likes=2, location=cls.location_2
        )
        cls.project_in_hub_2_1likes = create_project_test_data(
            number_of_likes=1, location=cls.location_2, has_parent_organization=True
        )
        cls.project_in_hub_1_1likes = create_project_test_data(
            number_of_likes=1, location=cls.location_1
        )
        cls.project_outside_of_timespan = create_project_test_data(
            number_of_likes=5, location=cls.location_1, created_outside_of_timespan=True
        )
        cls.project_no_hub_4likes = create_project_test_data(
            number_of_likes=4, has_parent_organization=True
        )
        cls.project_no_hub_0likes = create_project_test_data(number_of_likes=0)

        cls.org_in_hub_1 = create_org_test_data(location=cls.location_1)
        cls.org_in_hub_2 = create_org_test_data(location=cls.location_2)
        cls.org_no_hub = create_org_test_data()
        cls.org_in_hub_1_outside_of_timespan = create_org_test_data(
            location=cls.location_1, created_outside_of_timespan=True
        )

        cls.idea_in_hub_1 = create_idea_test_data(location=cls.location_1, hub=hub_1)
        cls.idea_in_hub_2_outside_of_timespan = create_idea_test_data(
            location=cls.location_2, hub=hub_2, created_outside_of_timespan=True
        )

        # creating user that receives all emails
        cls.admin_user = UserFactory(
            username="Admin",
            email=settings.MAILJET_ADMIN_EMAIL,
            first_name="You",
            last_name="Admin",
        )

    def test_entities(self):
        max_entities = 3
        timespan = timezone.now() - timedelta(days=7)
        is_in_hub = True

        # fetch entities in hub 1
        result = fetch_entities_for_weekly_recommendations(
            max_entities, timespan, self.location_1.id, is_in_hub
        )
        expected_result = [
            [self.project_in_hub_1_3likes.id],
            [self.org_in_hub_1.id],
            [self.idea_in_hub_1.id],
        ]
        self.assertEqual(result, expected_result)

        # fetch entities in hub 2
        result = fetch_entities_for_weekly_recommendations(
            max_entities, timespan, self.location_2.id, is_in_hub
        )
        expected_result = [
            [self.project_in_hub_2_2likes.id, self.project_in_hub_2_1likes.id],
            [self.org_in_hub_2.id],
            [],
        ]
        self.assertEqual(result, expected_result)

        # fetch international entities
        is_in_hub = False
        no_location = 0
        result = fetch_entities_for_weekly_recommendations(
            max_entities, timespan, no_location, is_in_hub
        )
        expected_result = [
            [self.project_no_hub_4likes.id, self.project_in_hub_1_3likes.id],
            [self.org_no_hub.id],
            [],
        ]
        self.assertEqual(result, expected_result)

    def test_user_data(self):
        # tests if the users_ids are generated correctly

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

        # for hub_2
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

        # for international
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

    def test_send_email(self):
        # this test will send emails to the mailjet_admin_email adress set in .backend_env
        # it sends emails for each hub/international and for each language, so a maximum number of 6 emails
        # to turn email sending on, set sandbox_mode to False
        sandbox_mode = True
        # to determine how many emails get sent, please set max_emails_sent variable to your desired number
        max_emails_sent = 2

        max_entities = 3
        timespan = timezone.now() - timedelta(days=7)

        all_locations_in_hubs = list(
            Location.objects.filter(hub_location__hub_type=1)
            .values_list("id", flat=True)
            .distinct()
        )
        # "0" acts as a flag for the international recommendations email
        all_locations_in_hubs.append(0)
        for location_id in all_locations_in_hubs:
            if location_id:
                is_in_hub = True
            else:
                is_in_hub = False

            mailjet_global_vars = fetch_and_create_globals_for_weekly_recommendations(
                max_entities, timespan, location_id, is_in_hub
            )

            lang_codes = list(
                Language.objects.values_list("language_code", flat=True).distinct()
            )
            if mailjet_global_vars:
                for lang_code in lang_codes:
                    if max_emails_sent < 1:
                        break
                    result = process_user_info_and_send_weekly_recommendations(
                        [self.admin_user.id],
                        mailjet_global_vars,
                        lang_code,
                        is_in_hub,
                        sandbox_mode,
                    )
                    self.assertEqual(result.status_code, status.HTTP_200_OK)
                    max_emails_sent -= 1
