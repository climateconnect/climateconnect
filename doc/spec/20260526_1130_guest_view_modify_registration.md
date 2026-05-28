# Guest views and modifies their event registration

**Type**: Task
**Status**: COMPLETED
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

#### Backend data delivery

- The guest's own registration data is delivered by **extending the existing
  project detail endpoint** `GET /api/projects/{slug}/` with a new read-only
  `my_event_registration` field on the response, populated only when the
  requesting user has an active `EventParticipant` for this project.
- **No new endpoint is introduced** for the guest self-view. Cancellation
  continues to use the existing `DELETE /api/projects/{slug}/register/`.
- The new field is returned on **detail only**, never on the list endpoint
  `GET /api/projects/`.
- Identity is derived strictly from `request.user`. The field's contents must
  never be addressable via a path or query parameter naming another user or
  registration id.
- The detail response with `my_event_registration` populated must not be
  cached by any shared cache.

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
- No backend schema changes are expected. This is a presentation +
  serializer-extension + endpoint-authorisation story.
- **No new backend endpoint** is added for guest self-view; the existing
  project detail endpoint is extended instead.
- No changes to organiser-side flows other than extracting/sharing the
  existing modal component in a backwards-compatible way.

### AI agent insights and additions

> These are suggestions from Taskie, not user-mandated requirements. Promote
> to core if confirmed with the product owner.

- **Endpoint approach — extend project detail**: add a new read-only field
  (working name `my_event_registration`) on the project detail serializer,
  sibling to the existing public `event_registration` block. Populated only
  when `request.user.is_authenticated` AND an `EventParticipant` row exists
  for `(user, project.event_registration)` with `cancelled_at IS NULL`;
  otherwise `null`/absent. Contents: the requesting user's standard
  registration info plus their custom field responses, using the
  field-type-aware shape defined in
  [#1880](https://github.com/climateconnect/climateconnect/issues/1880).
  Rationale: avoids a new endpoint, avoids a second round-trip from the
  project page, and keeps auth context exactly where it already is.
- **Privacy / caching**: per-user data on a mostly-public response is a
  caching footgun. Verify the project detail response is not cached by any
  shared cache when `my_event_registration` is present (`Cache-Control` /
  `Vary` headers; Next.js `getServerSideProps` is per-request with the
  user's cookies so SSR is fine, but check any explicit caching wrappers).
- **No IDOR**: derive identity strictly from
  `self.context["request"].user`; never from a path/query parameter.
- **List endpoint untouched**: do **not** add the field to
  `GET /api/projects/` — it would force a per-row user-scoped lookup and
  break list performance.
- **Query efficiency**: in the detail view, use a filtered
  `Prefetch("event_registration__participants", queryset=...)` so only the
  requesting user's participant row (and its custom field responses) is
  loaded — not every participant.
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
  - Backend: `GET /api/projects/{slug}/` returns `my_event_registration`
    populated for an authenticated registered guest (including their custom
    field responses); returns `null` for an unauthenticated request, for an
    authenticated non-registered user, and for a cancelled registration; the
    field is **absent** from `GET /api/projects/` list responses; another
    user's data is never leaked across requests.
  - Frontend: button label switches to _Modify registration_ (EN/DE);
    clicking opens the shared modal; the modal renders the guest's custom
    field responses; cancel inside the modal triggers the existing
    `DELETE /api/projects/{slug}/register/` flow; organiser callers of the
    same modal still render without a Cancel button.

---

## System impact

> To be completed by **Archie** (mosy-system-architect).

---

## Technical solution overview

> To be completed by the implementing agent (frontend-led; backend changes
> limited to extending the project detail serializer with
> `my_event_registration`).

---

## Log

- 2026-05-26 — Task created from GitHub issue #2003. Problem statement and
  AI insights drafted. No-regression constraint added for existing organiser
  callers of the shared modal. Backend approach pinned: extend the existing
  project detail endpoint with a `my_event_registration` field rather than
  introducing a new endpoint. Awaiting user review before handing off to
  Archie for system impact analysis.
