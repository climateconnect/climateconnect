"""
Timezone resolution and localised datetime formatting utilities.

These are generic helpers used by any part of the codebase that needs to
display a datetime to a user in their most relevant timezone and language.

Priority for timezone resolution:
    1. User's location ``centre_point``
    2. Project / event location ``centre_point``
    3. UTC fallback

Usage example::

    from climateconnect_api.utility.timezone_utils import (
        get_event_display_timezone,
        format_datetime_localized,
    )
    from climateconnect_api.utility.translation import get_user_lang_code

    tz = get_event_display_timezone(user, project)
    lang = get_user_lang_code(user)
    date_str = format_datetime_localized(project.start_date, lang, tz)
"""

import logging
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from timezonefinder import TimezoneFinder

logger = logging.getLogger(__name__)

# Module-level singleton — loading the binary data file once per process is
# significantly cheaper than re-creating it on every request / task.
_TF = TimezoneFinder()

# ---------------------------------------------------------------------------
# German month names
# ---------------------------------------------------------------------------
_DE_MONTHS = {
    1: "Januar",
    2: "Februar",
    3: "März",
    4: "April",
    5: "Mai",
    6: "Juni",
    7: "Juli",
    8: "August",
    9: "September",
    10: "Oktober",
    11: "November",
    12: "Dezember",
}

# Common timezone abbreviations that have a German equivalent.
# Anything not in this dict is displayed as-is (e.g. "UTC", "EST").
_DE_TZ_ABBREVS = {
    "CET": "MEZ",  # Mitteleuropäische Zeit
    "CEST": "MESZ",  # Mitteleuropäische Sommerzeit
}

_UTC = ZoneInfo("UTC")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def get_timezone_for_point(point) -> ZoneInfo:
    """
    Resolve an IANA timezone from a PostGIS ``PointField`` value.

    Args:
        point: A GEOSGeometry point (``point.x`` = longitude, ``point.y`` = latitude),
               or ``None``.

    Returns:
        A :class:`~zoneinfo.ZoneInfo` instance, or UTC if the point is ``None``,
        the lookup returns no result, or the returned name is unrecognised.
    """
    if point is None:
        return _UTC
    try:
        # NOTE: throughout this codebase Point objects are constructed as
        # Point(lat, lon) — i.e. the conventional x/y axes are swapped.
        # The admin (location/admin.py) documents this explicitly:
        #   lon = obj.centre_point.y   # Database Y is actually longitude
        #   lat = obj.centre_point.x   # Database X is actually latitude
        # timezonefinder.timezone_at() expects (lng=longitude, lat=latitude).
        lat = point.x
        lon = point.y
        tz_name = _TF.timezone_at(lng=lon, lat=lat)
        if tz_name is None:
            return _UTC
        return ZoneInfo(tz_name)
    except (ZoneInfoNotFoundError, Exception) as exc:
        logger.warning(
            "Timezone lookup failed for point (%s, %s): %s", point.x, point.y, exc
        )
        return _UTC


def get_event_display_timezone(user, project) -> ZoneInfo:
    """
    Determine the most appropriate display timezone for an event email.

    Resolution order:
        1. User's location ``centre_point`` (``user.user_profile.location.centre_point``)
        2. Project's location ``centre_point`` (``project.loc.centre_point``)
        3. UTC

    Both the user profile and project location are expected to have been
    pre-fetched (``select_related`` / ``prefetch_related``) by the caller to
    avoid N+1 queries.  Missing relations are handled silently via
    ``AttributeError`` catches.

    Args:
        user: Django ``User`` instance.
        project: ``Project`` instance for the event.

    Returns:
        A :class:`~zoneinfo.ZoneInfo` instance.
    """
    # 1. User's location
    try:
        point = user.user_profile.location.centre_point
        if point:
            return get_timezone_for_point(point)
    except AttributeError:
        # Missing user profile / location is acceptable; fall back to project / UTC.
        pass

    # 2. Project / event location
    try:
        point = project.loc.centre_point
        if point:
            return get_timezone_for_point(point)
    except AttributeError:
        # Missing project location is acceptable; fall back to UTC.
        pass

    # 3. UTC fallback
    return _UTC


def format_datetime_localized(dt, lang_code: str, tz: ZoneInfo) -> str:
    """
    Format a timezone-aware datetime in a language- and locale-appropriate way.

    Output formats:
        - English  (``lang_code == "en"``):
          ``"30 March 2026 at 14:00 (CET)"``  — day-first British convention
        - German   (``lang_code == "de"``):
          ``"30. März 2026 um 14:00 Uhr (MEZ)"`` — German month name and
          timezone abbreviation

    Args:
        dt:        A timezone-aware ``datetime`` object, or ``None``.
        lang_code: Two-letter language code (``"en"``, ``"de"``).
                   Unknown codes fall back to English.
        tz:        The :class:`~zoneinfo.ZoneInfo` timezone to display in.

    Returns:
        A formatted string, or ``"TBD"`` when ``dt`` is ``None``.
    """
    if dt is None:
        return "TBD"

    local_dt = dt.astimezone(tz)
    tz_abbrev = local_dt.strftime("%Z")

    day = local_dt.day
    year = local_dt.year
    time_str = local_dt.strftime("%H:%M")

    if lang_code == "de":
        month = _DE_MONTHS[local_dt.month]
        de_abbrev = _DE_TZ_ABBREVS.get(tz_abbrev, tz_abbrev)
        return f"{day}. {month} {year} um {time_str} Uhr ({de_abbrev})"

    # English (British) — also the default for unknown lang codes
    month = local_dt.strftime("%B")  # always English in the default C locale
    return f"{day} {month} {year} at {time_str} ({tz_abbrev})"
