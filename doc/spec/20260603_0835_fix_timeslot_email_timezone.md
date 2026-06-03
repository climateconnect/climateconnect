# Fix: Time-slot Times in Confirmation Email Shown in UTC

**Status**: DRAFT
**Type**: Bug Fix
**Date and time created**: 2026-06-03 08:35
**GitHub Issue**: [#2027](https://github.com/climateconnect/climateconnect/issues/2027)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260601_1031_include_field_answers_in_registration_email.md`](./20260601_1031_include_field_answers_in_registration_email.md) ← introduced field answers in email (including time-slot formatting)
- [`20260526_1100_time_slot_field_type_event_registration.md`](./20260526_1100_time_slot_field_type_event_registration.md) ← time-slot field type definition

---

## Problem Statement

When an event registration includes a time-slot field, the confirmation email displays the time-slot times in UTC instead of the user's local timezone. The frontend correctly converts UTC datetimes to the user's browser/OS timezone, but the backend email sends raw UTC times.

**Root cause**: The `_format_time_range_localized()` helper in `backend/organization/utility/email.py` (line 588) formats `start_time` and `end_time` directly with `strftime()` without any timezone conversion. The datetimes are stored in UTC in the database, so the email renders UTC times.

Meanwhile, the event's `StartDate` in the same email is correctly timezone-converted — `send_event_registration_confirmation_to_user()` computes `display_tz` via `get_event_display_timezone(user, project)` and passes it to `format_datetime_localized()`, which calls `dt.astimezone(tz)` before formatting. The time-slot path simply doesn't use this timezone.

**Core Requirements:**

1. Time-slot times in the confirmation email must be displayed in the same timezone as the event start date in the same email.
2. The timezone resolution must follow the same priority as the event start date: user location → event location → UTC fallback.
3. The time range format must include a timezone abbreviation (e.g. "CET", "MESZ") so the user knows which timezone the times refer to.

**Explicitly Out of Scope:**

- Storing user timezone preferences in the database.
- Changing how the frontend displays time-slots (already correct).
- Changing the admin notification email or organiser message email.
- Adding timezone information to other field types (no other field types store datetimes).

---

## System Impact

### Actors
- **Guest**: sees correct local times in the confirmation email instead of UTC.

### Entities Changed
- No model changes. No new entities.

### Flows Changed
- **Registration confirmation email**: time-slot times now timezone-converted.

### Integration Changes
- Internal function signatures change (not exposed via API).

---

## Software Architecture

### What needs to change

The timezone is already computed in `send_event_registration_confirmation_to_user()` as `display_tz`. It just needs to be threaded through to the time-slot formatting path.

**Current call chain (broken)**:
```
send_event_registration_confirmation_to_user()
  → display_tz = get_event_display_timezone(user, project)  ✓ computed
  → format_datetime_localized(project.start_date, lang_code, display_tz)  ✓ uses display_tz
  → _build_field_answers_html(registration, lang_code)  ✗ no display_tz
      → _format_time_range_localized(start, end, lang_code)  ✗ no tz conversion
```

**Fixed call chain**:
```
send_event_registration_confirmation_to_user()
  → display_tz = get_event_display_timezone(user, project)
  → format_datetime_localized(project.start_date, lang_code, display_tz)
  → _build_field_answers_html(registration, lang_code, display_tz)  ← pass display_tz
      → _format_time_range_localized(start, end, lang_code, display_tz)  ← pass display_tz
          → start.astimezone(tz), end.astimezone(tz)  ← convert before formatting
```

### Function changes

**1. `_format_time_range_localized(start, end, lang_code)` → add `tz` parameter**

Located at `backend/organization/utility/email.py:588`.

Add a `tz: ZoneInfo` parameter. Before formatting, convert both datetimes:
```python
def _format_time_range_localized(start, end, lang_code, tz):
    start = start.astimezone(tz)
    end = end.astimezone(tz)
    # ... rest of existing formatting logic unchanged ...
```

The formatted output should include the timezone abbreviation (e.g. "Mon, Jan 1, 10:00 – 12:00 (CET)") so the user knows the timezone context. This is consistent with `format_datetime_localized()` which already appends `(CET)` / `(MEZ)` to the event start date.

**2. `_build_field_answers_html(registration, lang_code)` → add `tz` parameter**

Located at `backend/organization/utility/email.py:615`.

Add a `tz: ZoneInfo` parameter and pass it to `_format_time_range_localized()`:
```python
def _build_field_answers_html(registration, lang_code, tz):
    # ...
    elif field_type == RegistrationFieldType.TIME_SLOT_SELECT:
        # ...
        answer_text = _format_time_range_localized(
            option.start_time, option.end_time, lang_code, tz
        )
```

**3. `send_event_registration_confirmation_to_user()` → pass `display_tz`**

Located at `backend/organization/utility/email.py:721`.

Change the call to `_build_field_answers_html` to include `display_tz`:
```python
field_answers_html = _build_field_answers_html(registration, lang_code, display_tz)
```

No other changes needed in this function — `display_tz` is already computed on line 758.

---

## Acceptance Criteria

- [ ] Time-slot times in the confirmation email are displayed in the user's resolved timezone (not UTC).
- [ ] The timezone abbreviation is shown after the time range (e.g. "Mon, Jan 1, 10:00 – 12:00 (CET)").
- [ ] The timezone resolution follows the same priority as the event start date: user location → event location → UTC.
- [ ] The event start date in the same email continues to display correctly (no regression).
- [ ] Other field types (checkbox, option_select, inventory) are unaffected.
- [ ] The German locale formatting is correct (timezone abbreviation uses German equivalents where applicable, e.g. "MESZ" instead of "CEST").
- [ ] Existing tests continue to pass.

---

## Test Cases

### Backend Tests

| Scenario | Expected |
|----------|----------|
| Time-slot with user in CET timezone | Email shows times in CET with "(CET)" suffix |
| Time-slot with user in UTC (no location) and event in CET | Email shows times in CET (falls back to event location) |
| Time-slot with no user location and no event location | Email shows times in UTC with "(UTC)" suffix |
| Time-slot with German locale | Timezone abbreviation uses German equivalent (e.g. "MESZ") |
| Event start date in same email | Still correctly timezone-converted (no regression) |
| Non-time-slot field types | Unaffected by the change |

### Existing Tests

The test at `backend/organization/tests/test_email_field_answers.py:180` (`test_time_slot_included`) creates time-slots using `timezone.now()` which returns UTC. After the fix, this test may need its assertions updated to account for the timezone suffix in the formatted output.

---

## Files to Change

| File | Change |
|------|--------|
| `backend/organization/utility/email.py` | Add `tz` parameter to `_format_time_range_localized()` and `_build_field_answers_html()`; add `astimezone(tz)` conversion; pass `display_tz` from `send_event_registration_confirmation_to_user()` |
| `backend/organization/tests/test_email_field_answers.py` | Update `test_time_slot_included` assertions to expect timezone abbreviation; add test for timezone conversion |

---

## Dependency Notes

- **Depends on**: `get_event_display_timezone()` and `format_datetime_localized()` in `backend/climateconnect_api/utility/timezone_utils.py` (already exist).
- **Enables**: Nothing directly — this is a bug fix.
- **No new migrations required**.
- **No new API endpoints required**.
- **No Mailjet template changes required** — the time range string is embedded in `FieldAnswersHtml` which is already rendered.

---

## Log

- 2026-06-03 08:35 — Spec created. Initial draft based on codebase analysis.

---

## Notes and Open Questions

1. **Timezone abbreviation in time range**: The current `_format_time_range_localized()` output does not include a timezone suffix (e.g. "Mon, Jan 1, 10:00 – 12:00"). After the fix, it should include one (e.g. "Mon, Jan 1, 10:00 – 12:00 (CET)") to match the event start date format and make the timezone explicit. This is a minor format change to an existing helper.

2. **German timezone abbreviations**: The `_DE_TZ_ABBREVS` mapping in `timezone_utils.py` already handles CET → MEZ and CEST → MESZ. The `_format_time_range_localized()` function in `email.py` has its own `_DE_MONTHS_SHORT` and `_DE_DAYS` mappings but no timezone abbreviation mapping. The timezone abbreviation should come from `local_dt.strftime("%Z")` (which gives the IANA abbreviation) and then be translated using the existing `_DE_TZ_ABBREVS` mapping if the lang_code is "de". This is consistent with how `format_datetime_localized()` handles it.

3. **Test isolation**: The existing `test_time_slot_included` test creates datetimes with `timezone.now()` (UTC). After adding timezone conversion, the formatted output will depend on the resolved timezone. The test should either: (a) mock `get_event_display_timezone` to return UTC so the output is deterministic, or (b) set up user/project locations to control the timezone. Option (a) is simpler for a unit test of `_build_field_answers_html`.

4. **Same timezone for start and end**: Since `start_time` and `end_time` are converted using the same `tz`, and both are stored in UTC, there's no risk of the start being in one timezone and the end in another. The timezone abbreviation will be the same for both.
