# Guest views and modifies their event registration

**Type**: Task
**Status**: DRAFT
**Branch**: `guest_view_modify_registration`
**GitHub Issue**: [#2003](https://github.com/climateconnect/climateconnect/issues/2003)
**Epic**: [EPIC: Event Registration](./EPIC_event_registration.md) — Phase 4 (guest-side companion to custom fields)
**Created**: 2026-05-26
**Owner**: CC

---

## Problem Statement

### Core (from user)

As an event guest, I want to see the details I provided when I registered for an
event so that I can verify them and remember them ahead of the event itself.

Today, the project page shows guests a **Cancel registration** button but
provides no way to review what they submitted — in particular, the values they
entered for the organiser's custom registration fields. As more events adopt
custom fields (Phase 4a), this gap will only grow.

**Requirements from the issue:**

1. **UI replacement**: On the project page, replace the existing
   _Cancel registration_ button with a **Modify registration** button
   (DE: _Anmeldung bearbeiten_).
2. **Modal trigger**: Clicking _Modify registration_ must open a modal that
   shows the guest the values they entered for the event's custom registration
   fields (plus standard registration info).
3. **Cancel action moves into the modal**: The _Cancel registration_ action
   must be available **inside** this modal — it is no longer a top-level
   button on the project page.
4. **Component reuse**: Reuse the **exact same modal component** that the
   project admin already uses to view a guest's submitted registration
   details. No new parallel component.
5. **Localisation**:
   - EN: `Modify registration`
   - DE: `Anmeldung bearbeiten`

### Acceptance criteria

- On the event project page, an authenticated guest who has an **active**
  registration sees a **Modify registration** button in place of the previous
  _Cancel registration_ button. The button is localised (EN / DE).
- Clicking the button opens a modal that displays the guest's own registration
  data, including any custom field responses (select, checkbox, and any future
  field types already shipped at the time of release).
- The modal is the same React component used by organisers to view a guest's
  registration — visual presentation and field rendering stay consistent
  between the two contexts.
- The modal contains a **Cancel registration** action that, when confirmed,
  performs the existing soft-delete cancellation (same backend behaviour as
  today's button — `DELETE /api/projects/{slug}/register/`).
- After successful cancellation the modal closes and the project page reflects
  the cancelled state (same UX as today — no regressions to
  [#1850](https://github.com/climateconnect/climateconnect/issues/1850)).
- All new/changed UI is gated behind `isEnabled("EVENT_REGISTRATION")`,
  consistent with the epic's toggle-first strategy.
- Guests can only see and modify **their own** registration. The endpoint that
  serves the data must enforce this (no organiser-only endpoint exposed to
  guests, no IDOR via registration id).
- No regression for events without custom fields: the modal still opens and
  shows the standard registration info plus a Cancel action.

#### No regression for existing modal callers

- Organiser views of the shared modal (from `ProjectRegistrationsContent.tsx`
  and any other current call sites) render **identically** to before this
  task — no new _Cancel registration_ button appears in the organiser
  context.
- The organiser's existing _Cancel guest registration_ flow
  ([#1872](https://github.com/climateconnect/climateconnect/issues/1872))
  continues to work end-to-end and still uses
  `PATCH /api/projects/{slug}/registrations/{registration_id}/` via
  `CancelGuestRegistrationModal.tsx`. That flow is **not** replaced by the
  new in-modal cancel action.
- The new guest-side cancel inside the modal uses
  `DELETE /api/projects/{slug}/register/` (self-cancel, soft delete via
  `cancelled_at`), not the organiser endpoint.
- Existing tests for the organiser modal and the organiser cancel-guest flow
  continue to pass without modification of their assertions.

### Non-goals

- Editing (changing) the values of custom field responses is **out of scope** —
  the button is named _Modify registration_ but in this iteration the only
  mutation offered is cancellation. (A future iteration may add value editing.)
- No backend schema changes are expected. This is a presentation + endpoint
  authorisation story.
- No changes to organiser-side flows other than extracting/sharing the
  existing modal component in a backwards-compatible way.

### AI agent insights and additions

> These are suggestions from Taskie, not user-mandated requirements. Promote
> to core if confirmed with the product owner.

- **Endpoint for guest self-view**: the organiser-side endpoint
  `GET /api/projects/{slug}/registrations/` returns _all_ guests and is
  permissioned for organisers/admins only. Consider either (a) a new
  guest-scoped endpoint such as `GET /api/projects/{slug}/register/` returning
  the requesting user's own `EventParticipant` record (including custom field
  responses), or (b) extending an existing member endpoint. The implementing
  agent should pick the approach that minimises new surface area while
  keeping authorisation simple. **No IDOR**: the endpoint must derive
  identity from the auth token, never from a path/query parameter naming
  another user or registration id.
- **Don't regress existing call sites of the shared modal**: the modal
  already has organiser callers. Treat the new cancel action as **opt-in
  via props** — for example a new optional prop (`cancelAction?: {...}` or a
  `mode: "organiser-view" | "guest-self"` discriminator). Default = today's
  behaviour, no Cancel button rendered. Organiser callers should not need to
  pass new props. Enumerate all current call sites in the PR description
  (grep for the modal component import) and re-verify them — visually and
  via tests — before merge.
- **Shared modal placement**: the modal currently lives close to
  `ProjectRegistrationsContent.tsx` (organiser context). To reuse it cleanly,
  consider moving it to a shared location such as
  `src/components/project/registration/RegistrationDetailsModal.tsx`. Keep
  the public prop contract backwards-compatible for existing organiser
  callers.
- **Button visibility states**: keep the existing button-state logic
  (registered / cancelled / full / closed / ended) — only the _label_ and
  _click handler_ of the “registered” state change.
- **Localisation**: add the EN/DE strings to `public/texts/project_texts.tsx`
  alongside the existing registration strings.
- **Toggle**: the new label and modal must sit behind
  `isEnabled("EVENT_REGISTRATION")`. Note: at the time of writing the toggle
  is still off in production, so this work ships dark with the rest of the
  epic.
- **Forward compatibility (per Phase 4)**: when rendering field responses,
  use the field-type-aware response shape already defined in
  [#1880](https://github.com/climateconnect/climateconnect/issues/1880) so
  that future field types (inventory, time slot) will render correctly with
  minimal additional work.
- **Tests**:
  - Backend: guest can fetch their own registration including custom field
    responses; cannot fetch another guest's; 404/403 cleanly when no
    registration exists.
  - Frontend: button label switches to _Modify registration_; clicking opens
    the modal; cancel inside the modal triggers the existing `DELETE /register/`
    flow; organiser callers of the same modal still render without a Cancel
    button.

---

## System impact

> To be completed by **Archie** (mosy-system-architect).

---

## Technical solution overview

> To be completed by the implementing agent (frontend-led; small backend
> additions if a guest-self endpoint is needed).

---

## Log

- 2026-05-26 — Task created from GitHub issue #2003. Problem statement and AI
  insights drafted, including no-regression constraint for existing organiser
  callers of the shared modal. Awaiting user review before handing off to
  Archie for system impact analysis.
