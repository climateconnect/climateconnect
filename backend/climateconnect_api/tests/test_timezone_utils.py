"""
Unit tests for climateconnect_api.utility.timezone_utils.

These tests mock the TimezoneFinder instance (_TF) so no binary data file
lookup is performed — tests are fast and fully offline.
"""
from datetime import datetime
from unittest.mock import MagicMock, patch
from zoneinfo import ZoneInfo

from django.test import SimpleTestCase

from climateconnect_api.utility.timezone_utils import (
    format_datetime_localized,
    get_event_display_timezone,
    get_timezone_for_point,
)

_UTC = ZoneInfo("UTC")
_BERLIN = ZoneInfo("Europe/Berlin")
_NEW_YORK = ZoneInfo("America/New_York")

_TF_PATH = "climateconnect_api.utility.timezone_utils._TF"


# ---------------------------------------------------------------------------
# get_timezone_for_point
# ---------------------------------------------------------------------------


class GetTimezoneForPointTests(SimpleTestCase):
    def test_none_point_returns_utc(self):
        self.assertEqual(get_timezone_for_point(None), _UTC)

    @patch(_TF_PATH)
    def test_known_coordinates_return_correct_zone(self, mock_tf):
        mock_tf.timezone_at.return_value = "Europe/Berlin"
        # Point is stored as Point(lat, lon) — x=lat=52.5, y=lon=13.4
        point = MagicMock(x=52.520008, y=13.404954)

        tz = get_timezone_for_point(point)

        self.assertEqual(str(tz), "Europe/Berlin")
        # Must be called with lng=y, lat=x (not the other way around)
        mock_tf.timezone_at.assert_called_once_with(lng=13.404954, lat=52.520008)

    @patch(_TF_PATH)
    def test_none_lookup_result_falls_back_to_utc(self, mock_tf):
        """timezonefinder returns None for some edge-case coordinates."""
        mock_tf.timezone_at.return_value = None
        point = MagicMock(x=0.0, y=90.0)

        tz = get_timezone_for_point(point)

        self.assertEqual(tz, _UTC)

    @patch(_TF_PATH)
    def test_lookup_exception_falls_back_to_utc(self, mock_tf):
        mock_tf.timezone_at.side_effect = Exception("binary read error")
        point = MagicMock(x=13.0, y=52.0)

        tz = get_timezone_for_point(point)

        self.assertEqual(tz, _UTC)

    @patch(_TF_PATH)
    def test_new_york_coordinates(self, mock_tf):
        mock_tf.timezone_at.return_value = "America/New_York"
        point = MagicMock(x=-74.006, y=40.7128)

        tz = get_timezone_for_point(point)

        self.assertEqual(str(tz), "America/New_York")


# ---------------------------------------------------------------------------
# get_event_display_timezone
# ---------------------------------------------------------------------------


class GetEventDisplayTimezoneTests(SimpleTestCase):
    @patch(_TF_PATH)
    def test_uses_user_location_when_available(self, mock_tf):
        mock_tf.timezone_at.return_value = "Europe/Berlin"

        point = MagicMock(x=13.4, y=52.5)
        user = MagicMock()
        user.user_profile.location.centre_point = point

        project = MagicMock()

        tz = get_event_display_timezone(user, project)

        self.assertEqual(str(tz), "Europe/Berlin")

    @patch(_TF_PATH)
    def test_falls_back_to_project_location_when_user_has_none(self, mock_tf):
        mock_tf.timezone_at.return_value = "America/New_York"

        # User has no location (AttributeError on centre_point access)
        user = MagicMock()
        user.user_profile.location.centre_point = None

        point = MagicMock(x=-74.0, y=40.7)
        project = MagicMock()
        project.loc.centre_point = point

        tz = get_event_display_timezone(user, project)

        self.assertEqual(str(tz), "America/New_York")

    def test_falls_back_to_utc_when_both_locations_missing(self):
        user = MagicMock()
        user.user_profile.location.centre_point = None

        project = MagicMock()
        project.loc.centre_point = None

        tz = get_event_display_timezone(user, project)

        self.assertEqual(tz, _UTC)

    def test_handles_missing_user_profile_gracefully(self):
        """user.user_profile raises AttributeError (no profile row)."""

        class _UserNoProfile:
            @property
            def user_profile(self):
                raise AttributeError("no profile")

        project = MagicMock()
        project.loc.centre_point = None

        tz = get_event_display_timezone(_UserNoProfile(), project)

        self.assertEqual(tz, _UTC)

    def test_handles_missing_project_location_gracefully(self):
        """project.loc is None — attribute access raises AttributeError."""

        user = MagicMock()
        user.user_profile.location.centre_point = None

        class _ProjectNoLoc:
            @property
            def loc(self):
                raise AttributeError("no loc")

        tz = get_event_display_timezone(user, _ProjectNoLoc())

        self.assertEqual(tz, _UTC)


# ---------------------------------------------------------------------------
# format_datetime_localized
# ---------------------------------------------------------------------------


class FormatDatetimeLocalizedTests(SimpleTestCase):
    def test_none_returns_tbd(self):
        self.assertEqual(format_datetime_localized(None, "en", _UTC), "TBD")
        self.assertEqual(format_datetime_localized(None, "de", _UTC), "TBD")

    def test_english_british_format(self):
        # 30 March 2026 14:00 UTC
        dt = datetime(2026, 3, 30, 14, 0, tzinfo=_UTC)
        result = format_datetime_localized(dt, "en", _UTC)
        self.assertEqual(result, "30 March 2026 at 14:00 (UTC)")

    def test_english_winter_time_cet(self):
        # 15 January 2026 12:00 UTC → 13:00 CET
        dt = datetime(2026, 1, 15, 12, 0, tzinfo=_UTC)
        result = format_datetime_localized(dt, "en", _BERLIN)
        self.assertEqual(result, "15 January 2026 at 13:00 (CET)")

    def test_english_summer_time_cest(self):
        # 15 July 2026 12:00 UTC → 14:00 CEST
        dt = datetime(2026, 7, 15, 12, 0, tzinfo=_UTC)
        result = format_datetime_localized(dt, "en", _BERLIN)
        self.assertEqual(result, "15 July 2026 at 14:00 (CEST)")

    def test_german_winter_time_mez(self):
        # 15 January 2026 12:00 UTC → 13:00 MEZ
        dt = datetime(2026, 1, 15, 12, 0, tzinfo=_UTC)
        result = format_datetime_localized(dt, "de", _BERLIN)
        self.assertEqual(result, "15. Januar 2026 um 13:00 Uhr (MEZ)")

    def test_german_summer_time_mesz(self):
        # 15 July 2026 12:00 UTC → 14:00 MESZ
        dt = datetime(2026, 7, 15, 12, 0, tzinfo=_UTC)
        result = format_datetime_localized(dt, "de", _BERLIN)
        self.assertEqual(result, "15. Juli 2026 um 14:00 Uhr (MESZ)")

    def test_german_all_months(self):
        """Verify every German month name is mapped correctly."""
        expected = [
            "Januar", "Februar", "März", "April", "Mai", "Juni",
            "Juli", "August", "September", "Oktober", "November", "Dezember",
        ]
        for month_num, name in enumerate(expected, start=1):
            dt = datetime(2026, month_num, 1, 10, 0, tzinfo=_UTC)
            result = format_datetime_localized(dt, "de", _UTC)
            self.assertIn(name, result, f"Month {month_num} should produce '{name}'")

    def test_unknown_lang_code_falls_back_to_english(self):
        dt = datetime(2026, 3, 30, 14, 0, tzinfo=_UTC)
        result = format_datetime_localized(dt, "fr", _UTC)
        # Should produce English format (the else branch)
        self.assertEqual(result, "30 March 2026 at 14:00 (UTC)")

    def test_unknown_timezone_abbreviation_used_as_is(self):
        # "America/New_York" in winter gives "EST" — not in DE_TZ_ABBREVS dict
        dt = datetime(2026, 1, 15, 12, 0, tzinfo=_UTC)
        result = format_datetime_localized(dt, "de", _NEW_YORK)
        # EST is not in _DE_TZ_ABBREVS, so it stays "EST"
        self.assertIn("EST", result)
        self.assertIn("Uhr", result)

    def test_time_is_converted_correctly_across_midnight(self):
        # 23:30 UTC → 00:30 CET next day (winter)
        dt = datetime(2026, 1, 15, 23, 30, tzinfo=_UTC)
        result = format_datetime_localized(dt, "en", _BERLIN)
        self.assertEqual(result, "16 January 2026 at 00:30 (CET)")

