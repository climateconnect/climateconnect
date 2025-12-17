from unittest.mock import Mock, patch

import requests
from celery.exceptions import Retry
from django.db import IntegrityError
from django.db.models.signals import post_save
from django.test import TestCase, override_settings

from climateconnect_api.models.language import Language
from location.models import Location, LocationTranslation
from location.signals import find_location_translations
from location.tasks import (
    create_name_from_translation_data,
    fetch_and_create_location_translations,
)

# Mock-Data for Nominatim API responses
NOMINATIM_RESPONSE_DATA_EN = [{
    'address': {
        'city': 'Erlangen',
        'state': 'Bavaria',
        'country': 'Germany'
    },
    'localname': 'Erlangen, Bavaria, Germany'
}]

NOMINATIM_RESPONSE_DATA_DE = [{
    'address': {
        'city': 'Erlangen',
        'state': 'Bayern',
        'country': 'Deutschland'
    },
    'localname': 'Erlangen, Bayern, Deutschland'
}]

MOCK_NOMINATIM_NOT_FOUND_RESPONSE = []


@override_settings(
    LOCALES=['en', 'de'],
    NOMINATIM_DETAILS_URL="http://mock.nominatim.test/lookup",
    CUSTOM_USER_AGENT="Test-Agent",
    CELERY_TASK_ALWAYS_EAGER=True,
    CELERY_TASK_EAGER_PROPAGATES=True
)


class LocationTaskTest(TestCase):

    def setUp(self):
        post_save.disconnect(find_location_translations, sender=Location)

        self.language_en = Language.objects.create(pk=1, name="English", language_code="en")
        self.language_de = Language.objects.create(pk=2, name="Deutsch", language_code="de")
        self.location = Location.objects.create(
            id=5,
            name="Original Location Name",
            city="Erlangen",
            country="Germany",
            osm_id=12345,
            osm_type="N"
        )
        self.loc_id = self.location.pk

    def tearDown(self):
        post_save.connect(find_location_translations, sender=Location)

    @patch('requests.get')
    def test_fetch_and_create_location_translations_success(self, mock_get):
        """
        tests translation creation after successful API call.
        """

        mock_response_en = Mock()
        mock_response_en.status_code = 200
        mock_response_en.json.return_value = NOMINATIM_RESPONSE_DATA_EN
        
        mock_response_de = Mock()
        mock_response_de.status_code = 200
        mock_response_de.json.return_value = NOMINATIM_RESPONSE_DATA_DE

        mock_get.return_value.json.side_effect = [
            NOMINATIM_RESPONSE_DATA_EN,
            NOMINATIM_RESPONSE_DATA_DE
        ]
        
        fetch_and_create_location_translations(self.loc_id)

        self.assertEqual(LocationTranslation.objects.count(), 2)

        en_translation = LocationTranslation.objects.get(language=self.language_en)
        self.assertEqual(en_translation.name_translation, 'Erlangen, Bavaria, Germany')
        self.assertEqual(en_translation.city_translation, 'Erlangen')
        self.assertEqual(en_translation.country_translation, 'Germany')
        self.assertEqual(en_translation.state_translation, 'Bavaria')
        self.assertEqual(en_translation.language_id, 1)
        self.assertEqual(en_translation.location_id, 5)

        de_translation = LocationTranslation.objects.get(language=self.language_de)
        self.assertEqual(de_translation.name_translation, 'Erlangen, Bayern, Deutschland')
        self.assertEqual(de_translation.country_translation, 'Deutschland')
        self.assertEqual(de_translation.city_translation, 'Erlangen')
        self.assertEqual(de_translation.state_translation, 'Bayern')
        self.assertEqual(de_translation.language_id, 2)
        self.assertEqual(de_translation.location_id, 5)

        self.assertEqual(mock_get.call_count, 2)


    @patch('location.tasks.logger')
    def test_fetch_and_create_location_translations_location_not_found(self, mock_logger):
        """
        tests that the task cleanly aborts when the Location is missing
        """
        
        fetch_and_create_location_translations(9999)

        mock_logger.error.assert_called_once_with(
            "location with ID 9999 does not exist anymore. Aborting task."
        )
        self.assertEqual(LocationTranslation.objects.count(), 0)

    @patch('location.tasks.logger')
    @patch('requests.get')
    def test_fetch_and_create_location_translations_api_failure_retries(self, mock_get, mock_logger):
        """tests that the task retries on API failure (HTTP 500)."""
        
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("500 Server Error")
        mock_get.return_value = mock_response

        # Bei bind=True Tasks muss man den Task selbst mocken
        with patch.object(fetch_and_create_location_translations, 'retry', side_effect=Retry()) as mock_retry:
            with self.assertRaises(Retry):
                fetch_and_create_location_translations(self.loc_id)

            mock_retry.assert_called_once()
        

    @patch('location.tasks.logger')
    def test_fetch_and_create_location_translations_api_resolution_error_retries(self, mock_logger):
        """
        tests that a real NameResolutionError (ConnectionError) triggers a Celery retry
        """
        with patch('requests.get') as mock_get:
            mock_get.side_effect = requests.exceptions.ConnectionError('Simulated resolution failure')

            with patch.object(fetch_and_create_location_translations, 'retry', side_effect=Retry()) as mock_retry:
                with self.assertRaises(Retry):
                    fetch_and_create_location_translations(self.loc_id)

                mock_retry.assert_called_once()

            self.assertEqual(LocationTranslation.objects.count(), 0)



    @patch('requests.get')
    @patch('location.tasks.logger')
    def test_fetch_and_create_location_translations_existing_translation(self, mock_logger, mock_get):
        """
        tests if existing translations are handled gracefully (with IntegrityError)
        """

        LocationTranslation.objects.create(
            location=self.location,
            language=self.language_de,
            name_translation="existing",
            city_translation="existing",
            country_translation="existing",
        )
        
        
        mock_get.return_value.json.side_effect = [
            NOMINATIM_RESPONSE_DATA_EN, # should pass
            NOMINATIM_RESPONSE_DATA_DE  # should fail
        ]

      
        fetch_and_create_location_translations(self.loc_id)
   

        self.assertEqual(LocationTranslation.objects.count(), 2)
        self.assertTrue(any("already exists" in call[0][0] for call in mock_logger.warning.call_args_list))

    


    # --- Tests for helper functions ---

    def test_create_name_from_translation_data_full(self):
        """
        tests the creation of a full name from all translated components
        """

        self.location.place_name = "City Hall"
        self.location.exact_address = "Silk Road 50"
        
        translation_data = {
            'translated_city': 'City',
            'translated_state': 'State',
            'translated_country': 'Country'
        }

        expected_name = "City Hall, Silk Road 50, City, State, Country"
        result = create_name_from_translation_data(self.location, translation_data)
        self.assertEqual(result, expected_name)


    def test_create_name_from_translation_data_minimal(self):
        """
        tests name creation with only city and country available
        """
        
        self.location.place_name = None
        self.location.exact_address = None
        self.location.state = None

        translation_data = {
            'translated_city': 'City',
            'translated_country': 'Country',
            'translated_state': None 
        }
        
        expected_name = "City, Country"
        result = create_name_from_translation_data(self.location, translation_data)
        self.assertEqual(result, expected_name)


    def test_create_name_from_translation_data_only_address_city_country(self):
        """
        tests name creation with only address, city and country available
        """

        self.location.place_name = None
        self.location.exact_address = "Silk Road 50"
        self.location.state = None

        translation_data = {
            'translated_city': 'City',
            'translated_country': 'Country',
            'translated_state': None 
        }

        expected_name = "Silk Road 50, City, Country"
        result = create_name_from_translation_data(self.location, translation_data)
        self.assertEqual(result, expected_name)

    @patch('requests.get')
    @patch('location.tasks.logger')
    def test_fetch_and_create_location_translations_empty_nominatim_response(self, mock_logger, mock_get):
        """
        tests that empty Nominatim responses are handled gracefully
        """
        mock_get.return_value.json.return_value = MOCK_NOMINATIM_NOT_FOUND_RESPONSE
        
        fetch_and_create_location_translations(self.loc_id)
        
        
        self.assertEqual(LocationTranslation.objects.count(), 0)
        
        warning_calls = [call[0][0] for call in mock_logger.warning.call_args_list]
        self.assertTrue(any("No Nominatim-Data found" in msg for msg in warning_calls))

    @patch('location.tasks.logger')
    @patch('requests.get')
    def test_fetch_and_create_location_translations_fallback_name(self, mock_get, mock_logger):
        """
        tests that name is built from translation_data when localname is missing
        """
        
        response_without_localname = [{
            'address': {
                'city': 'TestCity',
                'state': 'TestState',
                'country': 'TestCountry'
            },
            'localname': None  
        }]
        
        mock_get.return_value.json.return_value = response_without_localname
        
        fetch_and_create_location_translations(self.loc_id)

        self.assertEqual(LocationTranslation.objects.count(), 2)
        
        translation = LocationTranslation.objects.first()
        self.assertIsNotNone(translation)
        
        self.assertIn('TestCity', translation.name_translation)
        self.assertIn('TestCountry', translation.name_translation)

    def test_create_name_from_translation_data_empty(self):
        """
        tests name creation when all fields are empty/None
        """
        self.location.place_name = None
        self.location.exact_address = None

        translation_data = {
            'translated_city': None,
            'translated_state': None,
            'translated_country': None
        }
        
        result = create_name_from_translation_data(self.location, translation_data)
        self.assertEqual(result, "")