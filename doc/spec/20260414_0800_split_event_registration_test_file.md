# Split `test_event_registration.py` into a Tests Package

**Status**: COMPLETED
**Type**: Refactor (no logic changes)
**Date and time created**: 2026-04-14 08:00
**Date Completed**: 2026-04-15
**Related Specs**:
- All specs under `doc/spec/` prefixed `20260309_*`, `20260402_*`, `20260407_*`, `20260413_*` — these are the features whose tests live in the file being split.

---

## Problem Statement

`backend/organization/tests/test_event_registration.py` has grown to ~3,700 lines across 137 tests covering 10+ distinct feature areas. This causes:

- **Editing friction**: the file is too large to read in full in a single context window; agents and humans must scroll extensively to find relevant tests.
- **Merge conflicts**: multiple developers working on different event-registration features will frequently conflict on the same file.
- **PyCharm autosave race conditions**: large files open in PyCharm are more susceptible to the autosave/external-edit race condition documented in `backend/agent.md`.
- **Slow feedback**: running `python manage.py test organization.tests.test_event_registration` runs all 137 tests even when only one feature area changed.

---

## Proposed Solution

Convert the single file into a **`tests/` package** with one module per feature area. This is a pure refactor — no test logic changes, all 137 tests continue to pass.

### Target structure

```
backend/organization/tests/
    __init__.py                                  # empty
    _helpers.py                                  # shared: _make_black_image_b64, _CancellationTestBase
    test_event_registration_config.py            # Config CRUD, status, validation (~500 lines)
    test_event_registration_signup.py            # Member sign-up flow (~400 lines)
    test_event_registration_cancel.py            # Member self-cancel, re-register, my_interactions (~400 lines)
    test_event_registration_admin_cancel.py      # Admin cancel guest, list participants (~400 lines)
    test_event_registration_organiser_email.py   # Organiser email to guests (~400 lines)
    test_event_registration_notify_admins.py     # notify_admins flag (#1882) (~200 lines)
    test_event_registration_admin_notification.py # Admin notification emails (#1888) (~400 lines)
```

### Test class → file mapping

| Test class | Target file |
|---|---|
| `TestEventRegistrationCreate` | `test_event_registration_config.py` |
| `TestEventRegistrationRead` | `test_event_registration_config.py` |
| `TestEventRegistrationStatus` | `test_event_registration_config.py` |
| `TestEditEventRegistrationSettings` | `test_event_registration_config.py` |
| `TestEditEventRegistrationStatusChange` | `test_event_registration_config.py` |
| `TestListEventParticipants` | `test_event_registration_admin_cancel.py` |
| `TestSendOrganizerEmail` | `test_event_registration_organiser_email.py` |
| `TestMemberRegisterForEvent` | `test_event_registration_signup.py` |
| `_CancellationTestBase` | `_helpers.py` |
| `TestMemberCancelRegistration` | `test_event_registration_cancel.py` |
| `TestMemberReRegistration` | `test_event_registration_cancel.py` |
| `TestMyInteractionsRegistrationFields` | `test_event_registration_cancel.py` |
| `TestAdminCancelGuestRegistration` | `test_event_registration_admin_cancel.py` |
| `TestAdminCancelRegistrationListView` | `test_event_registration_admin_cancel.py` |
| `TestNotifyAdminsFlag` | `test_event_registration_notify_admins.py` |
| `TestNotifyAdminsFlagCreate` | `test_event_registration_notify_admins.py` |
| `TestAdminNotificationEmailDispatch` | `test_event_registration_admin_notification.py` |
| `TestAdminNotificationTask` | `test_event_registration_admin_notification.py` |

---

## Implementation Notes

- **Shared helpers**: `_make_black_image_b64()` and `_CancellationTestBase` are used by multiple test classes. Move them to `_helpers.py` and import from there.
- **No logic changes**: copy test methods verbatim; only change imports and file locations.
- **Delete the original file** after all classes have been moved and tests pass.
- **Verify**: run `pdm run python manage.py test organization.tests --keepdb` and confirm all 137 tests still pass.
- **Do not split while another developer has the file open** — coordinate via the PR/branch.

---

## Acceptance Criteria

- [x] `organization/tests/` is a package (has `__init__.py`)
- [x] Original `test_event_registration.py` is deleted
- [x] All 140 tests pass: `pdm run python manage.py test organization.tests --keepdb`
- [x] Each new file is ≤ 700 lines
- [x] Each new file has a module-level docstring listing the test classes it contains
- [x] `_helpers.py` contains only shared fixtures/base classes (no test methods)

> Note: the spec anticipated 137 tests; the file had grown to 140 by the time of implementation.

---

## Log

- 2026-04-14 08:00 — Task created. Pure refactor; no logic changes. Coordinate with other developers before merging — the original file is frequently edited.
- 2026-04-15 — Implemented. Split into 6 test modules + `_helpers.py`. All 140 tests pass. `TestMemberRegisterForEvent` referenced in the spec did not exist in the file (no such class was present); `test_event_registration_signup.py` was therefore not created.
