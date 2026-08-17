# Code Review #2: Refactor Browse Pages and Filter

**Reviewed**: 2026-08-17
**Branch**: `refactor-browse-pages-and-filtering`
**Previous review**: `doc/spec/20260817_code_review_refactor_browse_pages.md`

---

## Summary

All P0 bugs and P1 items from the first review have been addressed:

- ✅ `applyFilters` callback in organisations/members now correctly destructures `FilterContent` arguments
- ✅ `getHubBrowseTypeServerSideProps` uses `parentHubUrl` for `getHubTheme` (line 28-29, 49)
- ✅ `useUpcomingEvents` + `UpcomingEventsGroup` wired into `BrowseProjectsContent`
- ✅ Events page tab navigation uses new URLs (`/projects`, `/organisations`, `/members`)
- ✅ ~20 files with `/browse` references updated to new URLs
- ✅ `getBrowseServerSideProps` dead code deleted
- ✅ `BrowseContext` deleted, replaced with hardcoded `getProjectTypes()` in `public/data/projectTypes.ts`
- ✅ Dead `projectTypes` fetches removed from `profiles/[profileUrl].tsx` and `projects/[projectId]/index.tsx`
- ✅ Dead `getUnaffectedTabs` and `tabsWhereFiltersWereApplied` removed from `filterOperations.ts`/`FilterProvider.tsx`
- ✅ `useBrowseData` `texts` memoized with `useMemo`
- ✅ `useBrowseUrlSync` re-init handled via `key={router.asPath}` on content components
- ✅ Hardcoded English tab labels replaced with i18n `texts`
- ✅ `HubsDropDown` `currentHash` logic removed
- ✅ `Notification.tsx` and `CommentNotifications.tsx` `#ideas` links updated from `/browse` to `/projects` (but still reference `#ideas` — see below)

This is a clean, well-executed fix. Only 3 remaining issues found.

---

## P2: Remaining Issues

### 1. `#ideas` hash dead code in `ProfileRoot.tsx` (latent bug)

**File**: `frontend/src/components/profile/ProfileRoot.tsx:192, 207-208`

```tsx
const ideasRef = useRef(null);
...
if (URL.slice(-6) == "#ideas") {
  scrollDownSmooth(ideasRef);
}
```

`ideasRef` is created but never attached to any DOM element. The `#ideas` scroll
handler calls `scrollDownSmooth(ideasRef)` which does `ideasRef.current.scrollIntoView()`
— this would throw `TypeError: Cannot read properties of null` if `#ideas` is ever
in the URL.

**Fix**: Remove `ideasRef` and the `#ideas` handler block. The backend won't
generate new idea notifications (per session discussion), so this is dead code.

---

### 2. `#ideas` hash dead code in notification components

**Files**:
- `frontend/src/components/communication/notifications/Notification.tsx:270`
- `frontend/src/components/communication/notifications/CommentNotifications.tsx:43, 55`

The `#ideas` links were updated from `/browse` to `/projects` (good), but the
`#ideas` hash target and `?idea=` query param are still dead — no page renders
ideas. Per the session discussion, the backend won't generate new idea
notifications, so these are dead code.

**Fix**: Remove the `IdeaCommentNotification`, `IdeaCommentReplyNotification`, and
`PersonJoinedIdeaNotification` components and their dispatch cases in
`Notification.tsx`. Remove the idea notification types (`idea_comment`,
`reply_to_idea_comment`, `person_joined_idea`) from `NOTIFICATION_TYPES`.

---

### 3. `subHubInfoText` prop on `HubPageLayout` is orphaned

**File**: `frontend/src/components/hub/HubPageLayout.tsx:60, 77, 187`

```tsx
subHubInfoText?: string;
...
{subHubInfoText ?? texts.you_are_seeing_projects_related_to}
```

No caller passes `subHubInfoText`. It's accepted but always falls back to
`texts.you_are_seeing_projects_related_to`. The prop was likely added in
anticipation of the events page passing `"you_are_seeing_events_related_to"`,
but `events.tsx` doesn't pass it either.

**Fix**: Either remove the prop (since it's always the same text), or pass the
appropriate text from the events page. The first option is simpler.

---

## Test Coverage

New test files were added:
- `frontend/src/hooks/useBrowseData.test.tsx` — covers initialization, pagination,
  error handling, and duplicate loadMore prevention
- `frontend/src/hooks/useBrowseUrlSync.test.ts` — covers URL parsing, filter
  splitting, multiselect values, and the initialization guard

The new test files look well-structured. No issues found.

---

## Acceptance Criteria Checklist (Updated)

| Criterion | Status | Notes |
|-----------|--------|-------|
| Pages at `/projects`, `/organisations`, `/members` | ✅ | |
| Each page loads data independently | ✅ | Via `useBrowseData` hook |
| Filter state preserved when navigating | ✅ | Via `key={router.asPath}` remount |
| Filter fields adapt per type | ✅ | Via `possibleFilters` keyed by type |
| `URLSearchParams` API | ✅ | Used in `handleTabChange` |
| Redirects from old URLs | ✅ | Hash-based routing in redirect pages |
| Hub variants | ✅ | 6 hub + 6 sub-hub pages |
| Tab clicks navigate between pages | ✅ | |
| Mobile bottom menu navigates | ✅ | |
| All internal links updated | ✅ | All updated to new URLs |
| Upcoming events band | ✅ | Integrated in `BrowseProjectsContent` |
| Old files deleted | ✅ | `BrowseContent`, `TabContentWrapper`, `HubBrowsePage`, `BrowseContext` deleted |
| Project types hardcoded | ✅ | `getProjectTypes()` in `public/data/projectTypes.ts` |
| Dead `tabsWhereFiltersWereApplied` removed | ✅ | |
| Dead `getUnaffectedTabs` removed | ✅ | |
| Dead `projectTypes` fetches removed | ✅ | From `profiles` and `projects/[projectId]` |
| Hardcoded English tab labels → i18n | ✅ | |
| `useBrowseData` `texts` memoized | ✅ | Via `useMemo` |

---

## Recommendation

The refactor is in excellent shape. The 3 remaining items are all dead-code
cleanup (P2). The codebase is ready to merge after addressing them.
