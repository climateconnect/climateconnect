# Show profile image (and location) in member search results

**Status**: DRAFT
**Type**: Frontend — UI enhancement
**Date created**: 2026-10-20

**Issue**: [#2342 – Include profile image when showing member search results](https://github.com/climateconnect/climatehub/issues/2342)

**Depends on**:
- `frontend/src/components/search/AutoCompleteSearchBar.tsx`
- `frontend/src/components/profile/MiniProfilePreview.tsx`
- `frontend/src/components/communication/chat/UserSearchField.tsx`
- `frontend/src/components/shareProject/AddTeam.tsx`
- Backend `ListMemberProfilesView` (`GET /api/members/?search=`), `UserProfileStubSerializer` (no change needed)

---

## Problem Statement

Member search dropdowns show only `first_name + " " + last_name`. When several members share a name (or one person has multiple accounts), users cannot tell the results apart and may start a chat with, or add to a project team, the wrong person.

Both places that search members build the option row by hand:

```tsx
// UserSearchField.tsx (chat) and AddTeam.tsx (project team) — duplicated
const renderSearchOption = ({ key, ...props }, option) => (
  <li key={key} {...props}>
    <IconButton size="large"><AddCircleOutlineIcon /></IconButton>
    {option.first_name + " " + option.last_name}
  </li>
);
```

### What the API already returns

`/api/members/` uses `UserProfileStubSerializer`, which returns `id`, `first_name`, `last_name`, `url_slug`, `thumbnail_image`, `location` (translated name string or `null`) and `badges`. **No backend change is required.**

Once a member is selected, `MiniProfilePreview` already renders avatar + name from the same object, so the selected-member chips already work with images; only the dropdown rows lack them.

---

## User Stories

- As a user starting a chat, I want to see each result's profile picture so I can recognise the person I mean.
- As a project owner adding team members, I want to see the picture and location of each result so I can distinguish members with the same name.

---

## Acceptance Criteria

1. Each row in the member search dropdown shows the member's avatar (`thumbnail_image`, falling back to the MUI default avatar when missing) next to the name.
2. Each row shows the member's location as secondary text below the name when `location` is set; no empty line when it is `null`.
3. The existing add (`+`) icon and click/keyboard selection behaviour are unchanged.
4. Applies to both member search usages: chat user search (`UserSearchField`) and project team search (`AddTeam`).
5. Rows are not links inside the dropdown (selecting a row must add the member, not navigate to the profile).
6. Long names/locations are truncated with an ellipsis; the row does not grow taller than ~56px on mobile (360px viewport).
7. No new user-facing strings (location is data from the API).
8. No `@mui/styles` usage; styling via `styled()` / `sx`.

---

## Proposed Solution

### 1. Shared option renderer

Create `frontend/src/components/search/MemberSearchOption.tsx`, a small presentational component used by both call sites, replacing the duplicated inline `renderSearchOption`:

```tsx
<li key={key} {...props}>
  <IconButton size="large"><AddCircleOutlineIcon /></IconButton>
  <MiniProfilePreview profile={option} nolink size="medium" title={option.location} />
</li>
```

Reuse of `MiniProfilePreview` with `nolink` gives avatar, badge and name, and its existing `title` prop renders the location as secondary text. This is the "existing component that shows profile names with images" the issue suggests, so no new avatar markup is needed.

### 2. Call sites

- `UserSearchField.tsx`: replace the local `renderSearchOption` with `MemberSearchOption`.
- `AddTeam.tsx`: same.

`MiniProfilePreview` currently uses `@mui/styles` `makeStyles`. That is not in scope; if it has been migrated by the time this is implemented, no change is needed here (see the @mui/styles removal issue #2290). The new wrapper itself must use `styled()`/`sx`.

### 3. Backend

None. Optionally note that `/api/members/` responses are cached (`cache_page`), so image changes appear after cache expiry; this is existing behaviour.

---

## Open Questions

1. **Location display**: the issue asks for feedback before showing location. Proposal: include it (AC 2) as it is the strongest disambiguator after the image and is already in the payload. Confirm with the issue author (HaraldWalker).
2. Should unverified or hub-restricted members be searchable? Out of scope; unchanged.

---

## Testing

- Jest/RTL test for `MemberSearchOption`: renders name; renders `img` when `thumbnail_image` is set; renders location text only when present; does not render an anchor.
- Manual: chat "new chat" search and project "add team members" search with (a) a member with image + location, (b) one without image, (c) one without location, (d) two members with identical names; check at 360px width.
- `yarn lint`, `yarn check-types`, `yarn test`.

## Documentation

- No API/model change, so `doc/api-documentation.md` and `doc/domain-entities.md` are unaffected.
- No new user flow; `doc/mosy/flows/` unchanged.
