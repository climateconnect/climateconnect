# Refactor Frontend Hub Context Handling

## Problem Statement

Climate Connect shows projects, organisations, members, and dedicated hub landing pages. All of these can be scoped to a specific climate hub, but the frontend has no clean concept of "the active hub". Instead, the hub is identified in two parallel ways (the `?hub=<slug>` query parameter on non-dedicated pages and the `/hub/<slug>/...` path on dedicated hub pages), and that information is then drilled through many layers of components under inconsistent names (`hubUrl`, `hubPage`, `hubName`, `hubData`, `fromPage`).

The practical consequences we see today:

- **Lost hub context on navigation.** Because the `?hub=` query string is open-coded in ~40+ files via patterns like `hubUrl ? "?hub=" + hubUrl : ""`, it is easy to forget it on a new link. When it is missing, the user is silently dropped back to the global site even though everything they were looking at was hub-scoped.
- **Lost locale context on navigation.** The same pattern of open-coding `getLocalePrefix(locale) + "/path"` appears in 200+ places. When a developer forgets it, the user lands in the English site even though they were browsing in another language — another "silent" failure.
- **No single source of truth for the hubs list.** Every page that needs hubs calls `getAllHubs(locale)` in its own `getServerSideProps`, refetching on every navigation, and the result is passed down as props (sometimes as `hubs`, sometimes `allHubs`).
- **Inconsistent prop naming.** The same logical value is renamed as it goes down the tree — e.g. `hubUrl` (SSR) → `hubPage` (ProjectPage → ProjectPageRoot) → `hubUrl` again (descendants). On org pages the value is also stored as `hubName` and `hubData` inconsistently.
- **No reactive active-hub context.** `UserContext.hubUrl` is computed once in `pages/_app.tsx` from `router.query` and is the only app-wide source — but it carries only the slug string, no hub data, and component authors routinely read it from a URL snapshot rather than derive it where they need it.
- **Hub-data fetches are repeated per page.** `getHubData(slug, locale)` is called independently by every page that needs hub data, and `getHubTheme(slug)` is called separately on top of that. The two are never correlated.

A refactor is needed to give the frontend a single, reactive source of truth for "the active hub" (slug + data + theme) and the full list of hubs, and to centralize the link-building logic (locale prefix + `?hub=`) behind one helper that is used everywhere. The two transformations are closely related — both are URL-level concerns applied on every navigation — and folding them into a single `<HubLink>` / `withHub` helper makes the call sites simpler and the migration more mechanical.

## Acceptance Criteria

### Hub context (state)

- [ ] A `HubContext` is available to every page and component in the app and provides at minimum: the active hub slug, the full active hub object (when one is set), the active hub theme, and the full list of hubs.
- [ ] The active hub is derived reactively from the current URL (both `?hub=` and `/hub/<slug>/...`) and updates on client-side navigation without a full reload.
- [ ] The full hubs list is fetched once and shared app-wide. Pages that previously called `getAllHubs` in their own `getServerSideProps` no longer need to (they may still preload it server-side for SSR, but the client uses the shared value).
- [ ] Existing components that consumed `UserContext.hubUrl` still get a working value via the new hub context, with no behavior change visible to end users.
- [ ] Hub-specific theming (currently fetched per page via `getHubTheme`) is resolved through the same shared hub context and does not require a duplicate call.
- [ ] The dedicated `/hub/<slug>` landing page path and the `?hub=<slug>` query parameter continue to be accepted as inputs (no URL changes required for users).

### Link behavior (three categories)

Every link in the app belongs to exactly one of these three categories. The new link machinery must make the right one obvious at every call site.

- [ ] **Category A — "preserve hub" (the default for internal cross-entity navigation).** Going from a hub-scoped project page to that project's organisation, member profiles, share view, edit view, etc. The active hub follows the user. This is the default behavior of a new `<HubLink>` component and of a new `withHub(href)` helper. No opt-in prop is required.
- [ ] **Category B — "intentionally leave hub" (explicit opt-out).** Settings, dashboard, About, Imprint, Privacy, the global footer, "go to global browse", and any other link where the destination is genuinely global. A `<HubLink leaveHub>` prop (and a `withHub(href, { leaveHub: true })` second-arg form) must be used. Sites in this category must be greppable so a reviewer can audit the "leave hub" decisions in one place. Note: auth entry points (`/login`, `/signup`, `/signin`, `/resetpassword`) are NOT in this category — they should preserve the hub by default, so a user who lands on a hub, hits "Sign up", and comes back, lands on the hub.
- [ ] **Category C — "hub switching" (replaces the active hub with a different one).** The hub switcher dropdown (`HubsDropDown`), the "All climate hubs" / "All projects" links, and any other widget whose job is to navigate to a *different* hub. These widgets do **not** use `<HubLink>` — they construct their target paths directly from the hubs list (`/hubs/<new>/browse` or `/browse` with no `?hub=`).
- [ ] The hub switcher in particular must not append the *current* `?hub=` to a link targeting a different hub.

### Link behavior (locale)

The new link machinery also owns the locale prefix, which today is hand-concatenated in 200+ call sites via `getLocalePrefix(locale) + "/path"`. The bugs from this look the same as the hub bugs (silently wrong — user lands in English) but the design is different.

- [ ] **Locale is always on by default for any relative path.** Dropping the locale prefix on an internal link is almost never correct. `<HubLink>` and `withHub(...)` apply the locale prefix automatically to any `href` that is a relative path starting with `/`.
- [ ] **Locale is automatically skipped in exactly two cases, by path shape (no explicit opt-out required):**
  - The `href` is an absolute URL (starts with a protocol like `http://` or `https://`, or with `//`) — no transformation.
  - The `href` is an API path (starts with `/api/`) — these go through Axios and use the `locale` header, not the URL path. No prefix.
- [ ] `next/link`'s built-in `locale` handling is reused where possible (the component form passes through `next/link`'s default behavior) so the locale machinery composes with whatever the user has already wired up.
- [ ] `getLocalePrefix(locale)` continues to exist as a pure function for use in `getServerSideProps` redirect destinations and other server-side code that has no access to React context. `withHub(...)` and `<HubLink>` are built on top of it.

### Migration / mechanics

- [ ] A `<HubLink>` component is provided that wraps `next/link` (and accepts the same `href`/`as`/`replace`/`scroll`/`shallow`/`passHref`/`locale`/`prefetch` props) and additionally accepts a `leaveHub?: boolean` prop. When `leaveHub` is false (default), it reads the active hub from `HubContext` and appends `?hub=<slug>` to the resolved href. When `leaveHub` is true, it does not. The component also automatically applies the locale prefix for any relative `href` that is not an API path.
- [ ] A `withHub(href: string, options?: { leaveHub?: boolean; hubUrl?: string; locale?: string }): string` helper is provided next to `getLocalePrefix` in `public/lib/`. It is the function form of `<HubLink>`, used for cases that are not a component (e.g. `router.push(...)`, API URL building, share-URL construction, MUI `Button`/`Link` `href` props). The `hubUrl` override exists for tests and for the rare case where the caller knows a hub slug that is not the active one. The `locale` override exists so server-side callers (e.g. `getServerSideProps` redirect builders) can pass the current locale explicitly without needing React context.
- [ ] All ~30 call sites that today hand-concatenate `?hub=${hubUrl}` to an `href` are migrated to either `<HubLink>` (preferred) or `withHub(...)`.
- [ ] All ~200 call sites that today hand-concatenate `getLocalePrefix(locale) + "/path"` to an `href` are migrated to either `<HubLink>` (preferred) or `withHub(href, { locale })`. The href passed to the new helper should be the path without the locale prefix (e.g. `withHub("/projects/foo")` instead of `withHub("/de/projects/foo")`); the helper adds the prefix when appropriate. This makes the call sites greppable for "missing prefix" bugs.
- [ ] The migration is incremental: at every commit the build, lint, and tests must pass. Migration of the locale-prefix sites is sequenced *after* migration of the hub sites because the locale work is the larger of the two and benefits from the link-component pattern established by the hub work.
- [ ] Bare `?hub=` and bare `/<locale>/` string concatenation in JSX / component code is removed once the new machinery is in place at that call site.
- [ ] `UserContext.hubUrl` continues to work during the migration (it is shimmed to read from `HubContext`) and is removed in a follow-up only after `grep UserContext.hubUrl` returns zero non-test hits.

### Tests

- [ ] Active-hub resolution from `?hub=` query param.
- [ ] Active-hub resolution from `/hub/<slug>/...` path.
- [ ] Active-hub resolution from `/hub/<slug>/<subHub>/...` sub-hub path.
- [ ] `<HubLink>` appends `?hub=<slug>` to internal cross-entity links and does not append it when `leaveHub` is true.
- [ ] `<HubLink>` adds the locale prefix to a relative `href` (e.g. `/projects/foo` → `/de/projects/foo` for `de` locale) and does not add it to an absolute `href` or an `/api/` `href`.
- [ ] `withHub` returns the input unchanged when no hub is active and appends `?hub=<slug>` when one is.
- [ ] `withHub` adds the locale prefix when `locale` is provided and the href is a relative non-API path.
- [ ] The hub switcher does not add the *current* hub to its destinations.
- [ ] The hubs list is fetched once on initial app load (not once per page).
- [ ] Lint, format, and existing test suites pass.
- [ ] No backend API changes are required.

## Constraints and Non-Negotiable Requirements

- Changes are confined to the frontend (Next.js) codebase.
- All existing URLs must continue to work (`?hub=` query param, `/hub/<slug>/...` paths, hard-coded city hub pages, sub-hub paths). The refactor must not introduce URL changes visible to end users.
- Backward compatibility for components that currently read `UserContext.hubUrl` must be preserved during the migration. Removal of the legacy field from `UserContext` is allowed only after all consumers are migrated.
- No backend API changes; only existing endpoints (`/api/hubs/`, `/api/hubs/<slug>/`, hub theme endpoint) may be used.
- The refactor must not regress SSR — the active hub and its data must be available on first render so that hub-scoped pages still render correctly when reached directly (deep link, refresh, share).
- The hubs list must remain available without authentication (matching the current `/api/hubs/` behavior).
- The migration is incremental: at every commit the app must build, lint, and tests must pass. Big-bang replacement is not acceptable.
- "Preserve hub" is the **default** behavior of the new link machinery. A link only drops the hub context when the author explicitly opts out. This is intentional: it makes "user gets silently dropped off the hub" structurally impossible for any new code that uses the new components.
- "Apply locale prefix" is the **default** behavior of the new link machinery for any relative, non-API `href`. The two carve-outs (absolute URLs, `/api/` paths) are determined by the path shape itself, not by an opt-out flag. The rationale: a missing locale prefix on an internal link is almost never intentional, and the path-shape rule covers the only two real exceptions.
- The link machinery does **not** infer hub context from the destination path. There is no allowlist or denylist of "hub-related routes". A path-based heuristic was considered and rejected — it would couple the link machinery to the current route tree, drift over time, and would not generalize to non-component call sites (`router.push`, share-URL builders, API URL construction). The decision is made explicitly at the call site instead. (Contrast with locale, where a path-shape heuristic *is* appropriate because the two carve-outs — absolute URLs, `/api/` — are stable and exhaustive.)

## Domain Context

Climate Connect is a platform connecting climate activists, organisations, and projects globally. Hubs are community groupings — they can be geographic ("location hub", e.g. Marburg) or topical ("sector hub"). Some hubs have dedicated landing pages built in Webflow; others only have a browse view. A user on a hub-scoped page expects everything they click on to remain hub-scoped, and the platform's theming, supported languages, and feature visibility can differ per hub.

Today the frontend expresses "active hub" inconsistently, which is the root cause of the lost-context bugs and the prop-drilling tax. The dedicated `/hub/<slug>/...` routes and the `?hub=` query string are both legitimate entry points (e.g. hub landing pages vs. linking to a project from a hub's sub-header), so the refactor must unify them, not eliminate one.

## AI Insights

### Implementation Hints

- React Context is the right tool here (the project already uses it for `UserContext`, `FilterContext`, `FeatureToggleProvider`); a new `HubProvider` placed inside `UserContext.Provider` in `pages/_app.tsx` matches the existing pattern.
- The active-hub slug is already derivable from `router.query` (via `getHubslugFromUrl`) and from `router.asPath` (for `/hub/<slug>/...` route segments). One small resolver helper that prefers the path segment and falls back to the query would unify both sources.
- The hubs list endpoint (`/api/hubs/`) is unauthenticated and small enough to be fetched once on initial app load (client-side, after hydration) and cached. SWR or a plain `useEffect` + state both work — the project has no SWR/React-Query today, so a small custom hook (`useHubs()`) is consistent with the rest of the codebase.
- The hub-data endpoint (`/api/hubs/<slug>/`) is also unauthenticated and can be fetched on-demand when the active slug changes, with the result cached by slug.
- The `<HubLink>` component is a thin wrapper over `next/link`: it reads the active hub from `HubContext`, computes the resolved href with `withHub`, and forwards all other props unchanged. It is *not* a wrapper over MUI `Link` / `Button` / `CardActionArea` — those continue to receive the href directly, and their authors call `withHub(href)` to compute it.
- `withHub` is a tiny pure function: it (a) prepends the locale prefix to a relative non-API `href` when one is given, (b) appends `?hub=<slug>` when a hub is active and `leaveHub` is false, and (c) otherwise returns the input unchanged. Placing it next to `getLocalePrefix` in `public/lib/apiOperations.ts` (or a new `public/lib/hubLink.ts`) keeps link utilities together. The function form needs an explicit `locale` argument because it can be called from server-side code (`getServerSideProps` redirects) that has no React context; the component form reads the locale from `UserContext` automatically.
- The locale-prefix rule "if relative and not `/api/`, prefix; otherwise leave alone" is two `startsWith` checks. It is stable because the only two legitimate exceptions (external absolute URLs, API paths) are identified by the path shape itself. A new global page added to the app gets the prefix automatically; a new API endpoint added at `/api/...` automatically opts out. No flag, no list, no drift.
- A codemod or a careful sed pass over the ~30 call sites that currently write `?hub=` by hand, and then the ~200 call sites that currently write `getLocalePrefix(locale) + "/path"`, will cover the bulk of the link migration. The hub switcher (`HubsDropDown`, `HubLinks`) is exempt from this migration — it is Category C and constructs its own target paths.
- During the migration, `UserContext.hubUrl` is replaced with a shim that reads from `HubContext` so that components that still destructure it from `UserContext` keep working. `getLocalePrefix` stays as-is for server-side use.

### Trade-off Notes

- **One helper, two concerns (locale + hub).** Putting both transformations behind a single `<HubLink>` / `withHub` means the call sites are simpler (one helper, one signature) and the two bugs are addressed by the same migration. The cost is that the helper has a slightly busier signature. Given that the two transformations compose naturally (locale prefix is added to the path, `?hub=` is added after the query string), the busier signature is worth it.
- **Default vs. opt-out for "preserve hub".** Making "preserve hub" the default (rather than a per-link opt-in) trades a small, explicit chore (auditing the global-nav sites to add `leaveHub`) for a structural guarantee (no new code can accidentally drop the user off a hub). The current ~30 hand-rolled sites overwhelmingly want "preserve", so the default matches the dominant intent.
- **Default-on for locale, with a path-shape carve-out.** The locale case is different from the hub case. A missing locale prefix is almost never intentional on an internal link, so it would be wrong to require a per-link opt-in. The carve-outs (absolute URLs, `/api/`) are stable and identifiable from the path alone, so a path-shape rule is the right way to express them. This is the only place the refactor uses a path-based heuristic, and it is justified specifically because the rule is "exceptions only, exceptions are obvious from the string".
- **Component vs. function form.** Both `<HubLink>` and `withHub(href)` are provided because most call sites are not `next/link` — they are MUI `Link`/`Button` `href` props, raw `<a>` tags, `router.push` calls, share-URL builders, and API URL construction. A component-only solution would cover only 3 of the 30+ hub sites and almost none of the 200+ locale sites.
- **Hub switching is not a `<HubLink>` case.** The hub switcher replaces the active hub rather than preserving it, and it constructs target paths from the hubs list (where the slug comes from the destination, not the active context). A single `<HubLink>` that defaulted to "preserve" would do the wrong thing here. Category C sites are flagged as "do not use `<HubLink>`" in the spec and migrated by hand.
- **No path-based heuristic for hub.** An allowlist ("`/projects`, `/organizations`, `/profiles` are hub-related") or a denylist ("`/about`, `/imprint`, `/login` are not") was considered. Both drift as the route tree evolves, both have edge cases (is `/edit-project/...` hub-related? is the user's own `/dashboard` hub-related?), and both leave a class of bugs (a new global page would silently inherit or lose hub context depending on which list it landed in). A per-link explicit decision is the only choice that doesn't create a new bug surface.
- **Context vs. props.** Using context removes the prop-drilling tax and makes "is this page hub-scoped?" a one-line check (`useContext(HubContext).hubUrl`), but means every component subscribes to context updates. Because the active-hub value changes only on navigation, re-render cost is negligible. Worth it.
- **Server fetch vs. client fetch of the hubs list.** Fetching once in `_app.tsx`'s `getInitialProps` (Next.js legacy pattern) would populate the context synchronously on first SSR, but at the cost of slowing every page that doesn't need hubs. A client-side fetch on first mount (with SSR consumers still able to call `getAllHubs` directly when they need the value for server rendering) is a more surgical change.
- **Removing `UserContext.hubUrl` immediately vs. shimming it.** Shimming (keep the field but make it read from the new hub context) is safer and lets components migrate at their own pace; removing it should be a separate follow-up task once `grep UserContext.hubUrl` returns zero non-test hits.
- **Caching hub data.** Caching `getHubData` results by slug in memory is cheap and removes redundant requests when the user navigates between hub-scoped pages. There is no need for a real cache (LRU, TTL) until we measure one is needed.
- **Naming.** The spec uses `<HubLink>` / `withHub` because the trigger for the work is hub context, but the helpers also handle locale. The implementer may prefer a more general name (e.g. `<AppLink>`, `<LocaleLink>`). The behavior is the same; only the export name changes.
- **What the refactor does NOT solve.** The "sectors" concept (project categories) is separate and out of scope. The `CUSTOM_HUB_URLS` / `LOCATION_HUBS` env-var arrays stay where they are (on `UserContext` or migrated next to the new hub context — the implementer decides). Analytics / Sentry tagging of "user is on hub X" is also out of scope; it can subscribe to `HubContext` separately. Hub-landing-page content authored in Webflow/Devlink is content, not code, and is out of scope.
