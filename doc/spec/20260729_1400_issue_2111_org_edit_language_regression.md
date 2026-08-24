# Fix Organization Edit Language Regression And Get-Involved Translation

**Status**: DRAFT
**Type**: Bugfix (Backend + Frontend)
**Issue**: https://github.com/climateconnect/climateconnect/issues/2111
**Date created**: 2026-07-29

---

## Problem Statement

Editing an organization currently uses the active user locale instead of the organization's original source language.

Example:
1. Organization is created in English (`organization.language = en`).
2. Editor opens edit page with German locale (`de`).
3. Edit form is prefilled with German translated fields instead of original English fields.
4. Saving updates source fields using translated values and may re-translate again, causing translation drift.

This also causes the "Manage translations" step to show incorrect source text.

A second related bug is present:
- `get_involved` is not consistently auto-translated into `OrganizationTranslation.get_involved_translation`, causing missing content in other languages.

---

## Root Cause Analysis

### Root Cause A: Edit payload is loaded in request locale, not source language

Current edit data load path:
- Frontend edit page calls `GET /api/organizations/{slug}/?edit_view=true` with `locale` set to current user locale.
- Backend serializes edit response through `EditOrganizationSerializer`.
- `EditOrganizationSerializer` inherits language-aware field logic from `OrganizationSerializer` (`name`, `short_description`, `about`, `get_involved`) which reads values in current request language.

Net effect:
- Edit form source fields are localized values, not canonical source-language values.

### Root Cause B: Organization translation creation omits get-involved

When creating organization translations, helper `create_organization_translation(...)` sets:
- `name_translation`
- `short_description_translation` (optional)
- `about_translation` (optional)

But it does not set:
- `get_involved_translation`

Net effect:
- Newly created or auto-updated translations may miss "how to get involved" content.

---

## Scope

### In scope
- Ensure organization edit form always edits source-language fields.
- Ensure manage-translations step uses correct source-language content.
- Ensure `get_involved` is included in auto translation creation/update paths.
- Add/adjust tests for both bugs.

### Out of scope
- Reworking general public view localization behavior.
- Migration/backfill for already-broken translations (can be addressed separately).
- Changes to supported languages or translation provider.

---

## Proposed Solution

## 1) Return source-language values for edit view

Keep public organization view behavior unchanged, but change edit-view serialization behavior so editable base fields come from source values.

### Backend changes
- In `EditOrganizationSerializer`, override these getters to return base model values directly:
  - `get_name` -> `obj.name`
  - `get_short_description` -> `obj.short_description`
  - `get_about` -> `obj.about`
  - `get_get_involved` -> `obj.get_involved`

Rationale:
- Editing should always modify canonical source text.
- Translations should only be edited in the translation step.

### Frontend behavior after backend fix
- Edit form receives canonical source-language values regardless of user locale.
- Existing warning text about editing in another language can remain informational.

## 2) Include get-involved in translation creation/update

### Backend changes
- Update `create_organization_translation(...)` to persist `get_involved_translation` when key exists in `texts`.
- Verify that edit flow (`edit_translations(...)`) correctly handles `get_involved` for both manual and auto translation updates (already configured via `items_to_translate`; keep and validate).

---

## Files To Change

### Backend
- `backend/organization/serializers/organization.py`
  - `EditOrganizationSerializer` getter overrides for source fields.
- `backend/organization/utility/organization.py`
  - `create_organization_translation(...)` set `get_involved_translation`.

### Frontend
- No mandatory code changes expected for correctness.
- Optional cleanup: remove or soften warning text if product decides it is redundant after fix.

---

## Acceptance Criteria

- [ ] Editing an organization always shows source-language values for editable text fields (`name`, `short_description`, `about`, `get_involved`) even when current user locale differs.
- [ ] Saving an edit from a different locale updates source fields only (no accidental source overwrite from translated text).
- [ ] Manage-translations page uses correct source-language base text after entering from edit flow.
- [ ] `get_involved` is auto-translated and stored in `OrganizationTranslation.get_involved_translation` when translation objects are created/updated.
- [ ] Public non-edit organization endpoint remains locale-aware for display users.
- [ ] Automated tests cover both regression cases.

---

## Test Plan

### Backend tests

1. Edit-view returns source fields
- Add test in `backend/organization/tests/test_organization_views.py`:
  - Setup org with source language `en` and a `de` translation.
  - Call `GET /api/organizations/{slug}/?edit_view=true` with German request language.
  - Assert returned `name`, `short_description`, `about`, `get_involved` equal source values, not German translations.

2. Non-edit view remains localized
- Existing behavior check:
  - Same setup as above.
  - Call `GET /api/organizations/{slug}/` with German language.
  - Assert localized values are returned where translations exist.

3. get_involved translation is persisted
- Add test for creation/translation helper path:
  - Build `texts` containing `get_involved`.
  - Call translation creation flow (or endpoint-level create path).
  - Assert `OrganizationTranslation.get_involved_translation` is populated for target language.

### Manual QA

1. Create org in English with non-empty get-involved text.
2. Switch UI locale to German.
3. Open edit organization page.
4. Confirm editable fields are still English source text.
5. Save a small source edit and open translation step.
6. Confirm source text and generated German translation are coherent.
7. Verify German organization page shows translated get-involved content.

---

## Rollout And Risk

### Risk level
- Low to medium.

### Potential side effects
- Edit endpoint payload shape remains the same, but field value language source changes for edit mode. This is intended.
- Existing UI copy warning about "wrong language" may become less relevant functionally.

### Mitigation
- Add focused tests for edit and non-edit serializer behavior.
- Smoke-test create + edit + translation flows for both EN/DE.

---

## Open Questions

1. Should we keep the current user-facing warning that says users can only edit in source language, or update copy to clarify that source language is now automatically used in edit mode?
2. Do we want a one-time data backfill command to repair historical missing `get_involved_translation` entries for existing organizations?

---

## Implementation Notes

- Preserve current endpoint contract; fix behavior by serializer override rather than introducing new API params.
- Keep translation logic centralized in existing helpers (`edit_translations`, `create_organization_translation`).
- Follow existing backend conventions and run targeted tests under `backend/organization/tests/`.
