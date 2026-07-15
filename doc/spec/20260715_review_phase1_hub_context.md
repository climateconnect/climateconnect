# Code Review — Phase 1: `HubProvider` + `HubContext`

**Date:** 2026-07-15
**Scope:** Uncommitted changes implementing Phase 1 of `doc/spec/20260715_hub_context_rollout.md`
**Spec:** `doc/spec/20260715_hub_context_rollout.md`
**Companion spec:** `doc/spec/20260701_1205_refactor_frontend_hub_context.md`

## Files reviewed

| File | Status | Lines changed |
|------|--------|---------------|
| `frontend/src/components/context/HubContext.tsx` | New (untracked) | 104 |
| `frontend/src/components/context/HubContext.test.tsx` | New (untracked) | 98 |
| `frontend/pages/_app.tsx` | Modified | +40 / -4 |

## Gate check

| Gate | Result |
|------|--------|
| `yarn test` | 34/34 passed (4 suites) |
| `yarn lint` | Clean |
| `yarn format` | Clean |
| `yarn build` | Succeeds |

## Findings

### 1. `getInitialProps` disables static optimization for ALL pages — should-fix

**Location:** `frontend/pages/_app.tsx:350-361`

Adding `MyApp.getInitialProps` disables Next.js Automatic Static Optimization for every page in the application. Pages that currently have no `getServerSideProps` (e.g. `index.tsx`, `stream.tsx`, `zoom.tsx`, `terms.tsx`) will now be server-rendered on every request instead of being statically cached.

The spec describes the fetch as "once on the server (getInitialProps)" but does not call out this side effect. In practice the impact is limited because nearly every page already uses `getServerSideProps`, but it is still a regression for the handful that do not.

**Options:**
- Document this as a known trade-off in the spec and revisit during Phase 8 if it measurably affects TTFB.
- If those static-capable pages must remain static, consider alternative approaches (e.g. a middleware-injected header, a singleton cache at the module level, or fetching the hubs list only inside pages that need it — which is the current state, to be consolidated in Phase 8).

### 2. Double `getAllHubs` calls during SSR — fix now for 4 of 6 pages

**Location:** `frontend/pages/_app.tsx:356` plus six page-level `getServerSideProps` functions

The following pages call `getAllHubs` in their own `getServerSideProps`:

| Page | Line | SSR usage | Can drop now? |
|------|------|-----------|---------------|
| `pages/browse.tsx` | 33 | Pure pass-through → `allHubs` prop | **Yes** |
| `pages/events.tsx` | 47 | Pure pass-through → `allHubs` prop | **Yes** |
| `pages/projects/[projectId]/index.tsx` | 102 | Pure pass-through → `hubs` prop | **Yes** |
| `pages/hubs.tsx` | 47 | Pure pass-through → `hubs` prop | **Yes** |
| `pages/hubs/[hubUrl]/events.tsx` | 61 | Hub existence check (→ 404) + pass-through | No (needs list for routing) |
| `src/components/hub/HubBrowsePage.tsx` | 101 | Filters to `sectorHubs` subset + pass-through | No (needs list for derivation) |

Every SSR request to these six pages currently hits the hubs API twice (once in `_app.getInitialProps`, once in the page). The spec defers this cleanup to Phase 8, but **4 of the 6 pages can already drop their `getAllHubs` call today** because they only use the result as a prop — and the identical data is now available via `HubContext.hubs`.

**Suggested change (can be done in this PR or a quick follow-up):**

For each of the 4 "pure pass-through" pages, remove the `getAllHubs` call from `getServerSideProps` and have the component read `hubs` from `useContext(HubContext)` instead of receiving it as a prop. This eliminates 4 redundant API calls per SSR request with no behavior change. Example for `pages/hubs.tsx`:

```diff
 // getServerSideProps — remove getAllHubs
 export async function getServerSideProps(ctx: { locale: any }) {
-  return {
-    props: {
-      hubs: await getAllHubs(ctx.locale),
-    },
-  };
+  return { props: {} };
 }

 // Component — read from context
-export default function Hubs({ hubs }) {
+export default function Hubs() {
+  const { hubs } = useContext(HubContext);
   // ... rest unchanged
```

The remaining 2 pages (`hubs/[hubUrl]/events.tsx`, `HubBrowsePage.tsx`) legitimately need the list in `getServerSideProps` for routing/filtering logic and should keep the call until Phase 8.

### 3. `act()` warnings in HubContext tests — minor

**Location:** `frontend/src/components/context/HubContext.test.tsx:81-89`

The test "fetches hub data and theme on slug change, cached by slug" produces six React `act()` warnings in the console. The cause is that `setHubData`/`setHubTheme` (called inside a `useEffect` async callback at `HubContext.tsx:92-93`) are not wrapped in `act()` before `waitFor` checks the result.

The tests still pass because `waitFor` retries until the assertion succeeds, but the warnings pollute the test output and may become errors in future React versions.

**Suggested fix:** Replace `waitFor(() => expect(...))` with `await screen.findBy*` patterns or wrap the render in `act()`:

```tsx
it("fetches hub data and theme on slug change, cached by slug", async () => {
  setRouter({ hubUrl: "erlangen" });
  const { result } = renderHubContext([]);
  await waitFor(() => {
    expect(result.current.hubData).toEqual({ url_slug: "erlangen" });
    expect(result.current.hubTheme).toEqual({ primary: "#fff" });
  });
  expect(mockGetHubData).toHaveBeenCalledWith("erlangen", "en");
  expect(mockGetHubTheme).toHaveBeenCalledWith("erlangen");
});
```

### 4. `any[]` typing for hubs — nice-to-have

**Location:** `HubContext.tsx:17`, `_app.tsx:38`, `_app.tsx:339`, `HubContext.tsx:43`

The hubs list is typed as `any[]` throughout. The codebase already has a `HubData` type in `src/types`. At minimum, the `HubContextValue.hubs` field and the `HubProvider.initialHubs` prop could use a narrow shape like `{ url_slug: string; name: string }[]` to get basic autocompletion and type checking without coupling to the full `HubData` type.

### 5. Shim correctness — verified ✅

**Location:** `frontend/pages/_app.tsx:45`, `_app.tsx:290`

`HubContext` is new, so there are no existing direct consumers of it yet. The shim operates on the `UserContext` side: the old code at the pre-change `_app.tsx:284` called `getHubslugFromUrl(router.query)` directly to set `UserContext.hubUrl`; the new code reads the equivalent value from `HubContext` via `useContext(HubContext)` at line 45 and assigns it to the same `UserContext.hubUrl` field at line 290. Since `HubContext` internally calls the same `getHubslugFromUrl(router.query)` at `HubContext.tsx:47`, the values are identical and existing `UserContext.hubUrl` consumers are unaffected.

### 6. Provider nesting is correct ✅

**Location:** `frontend/pages/_app.tsx:333-348`, `_app.tsx:305-330`

`HubProvider` wraps `AppContent`, which contains `FeatureToggleProvider` → `UserContext.Provider`. `useContext(HubContext)` at line 45 is inside `AppContent`, correctly reading from the outer `HubProvider`. The nesting order matches the spec.

### 7. Hubs-list fallback fetch logic is correct ✅

**Location:** `frontend/src/components/context/HubContext.tsx:48,58-70`

When the server provides `initialHubs` (array or `null`):
- `null` (API failure) → `useState(null ?? [])` initializes to `[]`; `!null` is `true` → client-side fallback fires.
- `[]` (empty result) → `useState([] ?? [])` initializes to `[]`; `![]` is `false` → no refetch.
- `[...hubs]` (normal) → uses the server data directly; no refetch.

When `initialHubs` is `undefined` (not provided): `useState(undefined ?? [])` initializes to `[]`; `!undefined` is `true` → client-side fallback fires.

All paths are correct.

### 8. Hub data/theme caching is correct ✅

**Location:** `frontend/src/components/context/HubContext.tsx:53-54,72-100`

`useRef` caches keyed by slug. On slug change, cached values are set synchronously before the async fetch begins, then overwritten when the fetch completes. The `cancelled` flag in the cleanup function prevents stale state updates on rapid navigation. This matches the spec's "cached by slug" requirement.

### 9. `getInitialProps` error handling — acceptable

**Location:** `frontend/pages/_app.tsx:354-359`

The outer try/catch around `getAllHubs` is technically unreachable because `getAllHubs` already catches internally and returns `null`. However, it provides a safety net for unexpected errors (e.g. if the import itself fails). The `console.log(e)` could be `console.error(e)` for consistency with other error handlers in the codebase, but this is cosmetic.

### 10. `App.getInitialProps` call order — correct ✅

**Location:** `frontend/pages/_app.tsx:351-352`

`await App.getInitialProps(appContext)` is called first, preserving each page's own data fetching. The hubs fetch is appended to `pageProps` afterwards. This ensures existing page props are not overwritten.

## Spec compliance checklist

| Spec requirement | Status |
|-----------------|--------|
| `HubProvider` placed outside `UserContext.Provider` | ✅ |
| Hubs list fetched once on the server (`getInitialProps`) | ✅ (per SSR request; see finding #1, #2) |
| Exposes: active hub slug, active hub object, active hub theme, full hubs list | ✅ |
| Active slug derived from `router.query` (`hubUrl` preferred, `?hub=` fallback) | ✅ |
| `UserContext.hubUrl` becomes a shim reading from `HubContext` | ✅ |
| Hub data/theme fetched on slug change, cached by slug | ✅ |
| Resolver unit tests (`?hub=`, `/hubs/<slug>`, sub-hub → top-level slug) | ✅ |
| Hubs-list fetched once test | ✅ |
| Behavior unchanged (shim keeps old API working) | ✅ |

## Recommendation

**Ready to merge** with one caveat: finding #1 (static optimization regression) should be acknowledged in the spec or commit message. Finding #2 recommends dropping `getAllHubs` from 4 pure pass-through pages now — this is a small, low-risk change that eliminates redundant API calls immediately rather than waiting for Phase 8. The `act()` warnings (#3) can be fixed in a follow-up. All other findings are cosmetic.
