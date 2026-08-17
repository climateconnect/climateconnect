# Domain Migration Redirects: climateconnect.earth ↔ climatehub.org

**Date**: 2026-06-18  
**Status**: DRAFT  
**Type**: Frontend — feature  
**GitHub Issue**: [#2065](https://github.com/climateconnect/climateconnect/issues/2065)

---

## Problem Statement

Climate Connect is migrating from `climateconnect.earth` to `climatehub.org`. Before the switch, the new domain will be communicated to partners and users — those links must already work by redirecting to the current platform. After the switch, the old domain must redirect to the new one. Hub subdomains (e.g. `erlangen.climatehub.org`) must also redirect to the correct hub pages on the active domain.

### Why it matters

- **Communication timeline**: Hub URLs like `climatehub.org` and `erlangen.climatehub.org` will be shared before the domain switch. They must resolve correctly from day one.
- **Fast switching**: The redirect direction must be changeable in minutes, not the ~40 minutes a full deployment takes. Azure deployment slot swaps with environment variable changes provide this.
- **Subdomain redirects**: Hub subdomains on both domains must redirect to the correct hub pages with path preservation (e.g. `erlangen.climatehub.org/projects/my-project` → `climateconnect.earth/hubs/erlangen/projects/my-project`).
- **One-time transition**: This is a single migration from `climateconnect.earth` to `climatehub.org`. The implementation can be simple and explicit — no abstraction needed for future domain changes.

### Current state

- The platform runs on `climateconnect.earth`.
- Hub subdomains (`erlangen.climateconnect.earth`, etc.) redirect to hub pages via `next.config.js` redirects (spec #2066).
- The existing subdomain redirects do NOT preserve paths — this is a bug that will be corrected as part of this work.
- `CLIMATEORG_ACTIVE` does not exist yet.
- The project already has env-var-based feature toggles (`WASSERAKTIONSWOCHEN_FEATURE`, `DONATION_CAMPAIGN_RUNNING`) — same pattern will be used.

---

## Scope

### In scope

1. `CLIMATEORG_ACTIVE` environment variable toggle (`"true"` / `"false"`).
2. Cross-domain main-domain redirects: `climateconnect.earth` ↔ `climatehub.org` (path-preserving).
3. Cross-domain subdomain redirects: `*.climateconnect.earth` ↔ `*.climatehub.org` (path-preserving, language-aware).
4. Potsdam project shortcut redirects on the new domain (`potsdam.climatehub.org/balkonsolar`, etc.).
5. Fix existing `*.climateconnect.earth` subdomain redirects (spec #2066) to preserve paths.
6. UTM parameters on cross-domain subdomain redirects for traffic attribution.

### Out of scope

- DNS configuration for `climatehub.org` and `*.climatehub.org` (infrastructure concern).
- Backend / Django changes.
- Dynamic runtime toggle switching (Azure slot swap + restart is sufficient).
- Content or UI changes for the new domain.
- Removing the toggle after migration is complete (separate cleanup task).
- Language-based redirects on the main domain (only applied to subdomain redirects).

---

## Acceptance Criteria

### AC-1: CLIMATEORG_ACTIVE environment variable

A new environment variable `CLIMATEORG_ACTIVE` is added. It accepts `"true"` or `"false"` (string, same pattern as `WASSERAKTIONSWOCHEN_FEATURE`). It is added to the `env` pick list in `next.config.js` so it is available client-side for future use (e.g. conditional link generation).

**Default**: `"false"` (pre-switch state).

### AC-2: Main domain redirect (path-preserving)

**When toggle is `"false"` (pre-switch):**
```
climatehub.org/some/path → 302 → climateconnect.earth/some/path
```

**When toggle is `"true"` (post-switch):**
```
climateconnect.earth/some/path → 301 → climatehub.org/some/path
```

- Path is preserved in both directions.
- Query parameters are preserved by Next.js redirect behavior.
- 302 (temporary) pre-switch: the redirect direction will change, so browsers must not cache.
- 301 (permanent) post-switch: the migration is final.

### AC-3: Cross-domain subdomain redirects for location hubs (language-aware)

Hub pages have no sub-paths for projects (projects use their own URL with `?hub=` param), so incoming paths are dropped and visitors are always sent to the hub landing page.

**When toggle is `"false"`:**

German visitors (`Accept-Language` starts with `de`):
```
erlangen.climatehub.org/*
  → 302 → climateconnect.earth/de/hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen
```

English fallback (no locale prefix — English is the default locale):
```
erlangen.climatehub.org/*
  → 302 → climateconnect.earth/hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen
```

**When toggle is `"true"`:**

German visitors:
```
erlangen.climateconnect.earth/*
  → 301 → climatehub.org/de/hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen
```

English fallback (no locale prefix — English is the default locale):
```
erlangen.climateconnect.earth/*
  → 301 → climatehub.org/hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen
```

- Incoming path is not appended to the destination (hub pages have no sub-paths).
- UTM parameters are appended for traffic attribution.
- German entries are defined before English entries so German-speaking visitors get the German locale.
- Applies to all slugs in `LOCATION_HUBS`.

### AC-4: Potsdam project shortcuts on new domain

**When toggle is `"false"`:**

| Source (on `potsdam.climatehub.org`) | Destination |
|---|---|
| `/balkonsolar` | `climateconnect.earth/de/projects/potsdam-balkon-solar?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=balkonsolar` |
| `/stadtacker` | `climateconnect.earth/de/projects/stadtacker-eine-bildungsgartnerei-der-zukunft-fur-potsdam?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=stadtacker` |
| `/fassadenbegrünung` | `climateconnect.earth/de/projects/stadtgrun-fassadenbegrunung?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=balkonsolar` |

All are 302 (temporary) pre-switch.

**When toggle is `"true"`:**

Same Potsdam project shortcuts but redirecting from `potsdam.climateconnect.earth` to `climatehub.org` equivalents. All are 301 (permanent).

### AC-5: Existing subdomain redirects unchanged

The existing `*.climateconnect.earth` subdomain redirects in `buildSubdomainRedirects()` (spec #2066) drop the incoming path, sending visitors to the hub landing page. This is intentional — hub pages have no sub-paths. No change is needed.

### AC-6: Existing redirects are not broken

All existing redirects in `next.config.js` (`/spenden` → `/de/donate`, `/klimapuzzle` → etc., Wasseraktionswochen conditional redirect) continue to work unchanged.

### AC-7: Redirect ordering is correct

Next.js evaluates redirects in order and stops at the first match. The redirect array is ordered:

1. Potsdam project shortcuts on the inactive domain (most specific, must match before generic subdomain redirect)
2. Cross-domain subdomain redirects for all LOCATION_HUBS (language-aware: German first, then English fallback)
3. Main domain redirect (catches everything else on the inactive domain)
4. Existing `*.climateconnect.earth` subdomain redirects (spec #2066)
5. Existing static redirects (`/spenden`, `/klimapuzzle`, etc.)

---

## Constraints

- **Frontend only** — changes in `frontend/next.config.js` and `frontend/.env`. No backend changes.
- **No new dependencies** — uses Next.js built-in `redirects()` with `has` conditions.
- **Hardcoded domain** — `climatehub.org` is hardcoded. One-time transition, no need for a `NEW_DOMAIN` env var.
- **Simple toggle, duplicated code** — redirect blocks for `"true"` and `"false"` are separate, explicit arrays. No shared abstraction. After migration, the `"false"` block is deleted.
- **Azure slot swap for fast switching** — changing `CLIMATEORG_ACTIVE` in the Azure deployment slot and swapping takes ~2 minutes vs ~40 minutes for a full deploy.
- **Location hubs** — uses existing `LOCATION_HUBS` env var for subdomain redirect generation.

---

## Domain Context

### How the toggle works in practice

`CLIMATEORG_ACTIVE` is a build-time environment variable read by `next.config.js` at startup. To switch:

1. Set `CLIMATEORG_ACTIVE=true` in the Azure deployment slot environment variables.
2. Swap deployment slots.

The app restarts with the new env var, `redirects()` generates the post-switch redirect rules, and all traffic is redirected to `climatehub.org`.

### Path preservation in Next.js redirects

The main domain catch-all preserves paths using `/:path*` in both source and destination:

```js
{
  source: "/:path*",
  has: [{ type: "host", value: "climatehub.org" }],
  destination: `${BASE_URL}/:path*`,
  permanent: false,
}
```

Hub subdomain redirects use `/:path*` in the source to catch any incoming URL, but do **not** append the path in the destination — visitors are always sent to the hub landing page regardless of what path they arrived on.

### Redirect ordering

Next.js evaluates redirects in order and stops at the first match. The order ensures:

1. **Potsdam project shortcuts** match before the generic `potsdam.*` subdomain redirect.
2. **German entries** match before English entries for language-aware redirects.
3. **Subdomain redirects** match before the main domain redirect (subdomains are more specific).
4. **Main domain redirect** catches any other path on the inactive domain.

### Relationship to spec #2066

Spec #2066 handles `*.climateconnect.earth` → hub page redirects on the active domain. This spec (#2065) adds cross-domain redirects for the inactive domain. They work together:

- When `CLIMATEORG_ACTIVE=false`: `erlangen.climatehub.org` is redirected to `climateconnect.earth/hubs/erlangen/...` by this spec. The #2066 redirects are not involved because the visitor lands on `climateconnect.earth` (the active domain).
- When `CLIMATEORG_ACTIVE=true`: `erlangen.climateconnect.earth` is redirected to `climatehub.org/hubs/erlangen/...` by this spec. The #2066 redirects are not involved because the visitor lands on `climatehub.org` (the active domain).
- In both cases, the #2066 redirects handle direct visits to hub subdomains on the active domain (no cross-domain redirect needed).

### UTM parameters for traffic attribution

Cross-domain subdomain redirects include UTM parameters:

| Parameter | Value | Purpose |
|---|---|---|
| `utm_source` | `subdomain` | Traffic from a hub subdomain |
| `utm_medium` | `redirect` | Via redirect (vs. link, ad, etc.) |
| `utm_campaign` | `{hubSlug}` | Which hub subdomain |
| `utm_content` | `{projectSlug}` | (Potsdam project shortcuts only) Which project shortcut |

---

## AI Agent Insights

### Why duplicate code instead of abstraction

The two toggle states have different `permanent` values (302 vs 301), different source domains, and different destination domains. Abstracting this into a shared function would add complexity for a configuration block that will be simplified after migration (delete the `"false"` block, keep the `"true"` block as permanent redirects). Duplication is the right tradeoff for short-lived configuration code.

### Edge case: LOCATION_HUBS is empty

If `LOCATION_HUBS` is not set, `split(",").filter(Boolean)` produces `[]`. No subdomain redirects are generated. Only the main domain redirect applies, which is correct.

### DNS prerequisite

DNS must be configured for `climatehub.org` and `*.climatehub.org` (wildcard subdomain) to point to the Next.js application. For the pre-switch phase, DNS for the new domain should already be live so that the redirects work. This is an infrastructure concern outside this spec.

### Testing with UTM params vs. without

The existing #2066 subdomain redirects include UTM parameters. The new cross-domain subdomain redirects should also include them for consistency. The main domain redirect does NOT include UTM parameters because it's a whole-domain redirect, not a specific traffic source.

---

## Implementation Notes

### Files to change

| File | Change |
|---|---|
| `frontend/.env` | Add `CLIMATEORG_ACTIVE="false"` |
| `frontend/next.config.js` | Add `CLIMATEORG_ACTIVE` to env pick list, add domain redirect logic in `redirects()` |

### Structure of changes in next.config.js

1. Read `CLIMATEORG_ACTIVE` from `process.env` (alongside `BASE_URL` and `LOCATION_HUBS` at top of file).
2. Add `CLIMATEORG_ACTIVE` to the `env` pick list.
3. In `redirects()`:
   a. Build `domainRedirects` array based on toggle state:
      - If `"true"`: `climateconnect.earth` → `climatehub.org` redirects (301, permanent)
      - If not `"true"` (default): `climatehub.org` → `climateconnect.earth` redirects (302, temporary)
   b. Each block contains: Potsdam project shortcuts, language-aware subdomain redirects for all LOCATION_HUBS (destination is the hub landing page, path dropped), main domain catch-all redirect (path preserved).
   c. Return: `[...domainRedirects, ...buildSubdomainRedirects(), ...existingRedirects]`.

### Example code structure

```js
const CLIMATEORG_ACTIVE = process.env.CLIMATEORG_ACTIVE === "true";

// In redirects():
let domainRedirects = [];

if (CLIMATEORG_ACTIVE) {
  // Post-switch: climateconnect.earth → climatehub.org (permanent 301)
  domainRedirects = [
    // 1. Potsdam project shortcuts on climateconnect.earth
    {
      source: "/balkonsolar",
      has: [{ type: "host", value: "potsdam.climateconnect.earth" }],
      destination: `${BASE_URL}/de/projects/potsdam-balkon-solar?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=balkonsolar`,
      permanent: true,
    },
    // ... stadtacker, fassadenbegrünung (same pattern)
    // 2. Subdomain redirects: *.climateconnect.earth → climatehub.org/hubs/{slug}
    ...LOCATION_HUBS.map((hubSlug) => ({
      source: "/:path*",
      has: [
        { type: "host", value: `${hubSlug}.climateconnect.earth` },
        { type: "header", key: "Accept-Language", value: "^de" },
      ],
      destination: `https://climatehub.org/de/hubs/${hubSlug}?utm_source=subdomain&utm_medium=redirect&utm_campaign=${hubSlug}`,
      permanent: true,
    })),
    ...LOCATION_HUBS.map((hubSlug) => ({
      source: "/:path*",
      has: [{ type: "host", value: `${hubSlug}.climateconnect.earth` }],
      destination: `https://climatehub.org/hubs/${hubSlug}?utm_source=subdomain&utm_medium=redirect&utm_campaign=${hubSlug}`,
      permanent: true,
    })),
    // 3. Main domain redirect
    {
      source: "/:path*",
      has: [{ type: "host", value: "climateconnect.earth" }],
      destination: `https://climatehub.org/:path*`,
      permanent: true,
    },
  ];
} else {
  // Pre-switch: climatehub.org → climateconnect.earth (temporary 302)
  domainRedirects = [
    // 1. Potsdam project shortcuts on climatehub.org
    {
      source: "/balkonsolar",
      has: [{ type: "host", value: "potsdam.climatehub.org" }],
      destination: `${BASE_URL}/de/projects/potsdam-balkon-solar?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=balkonsolar`,
      permanent: false,
    },
    // ... stadtacker, fassadenbegrünung
    // 2. Subdomain redirects: *.climatehub.org → climateconnect.earth/hubs/{slug}
    ...LOCATION_HUBS.map((hubSlug) => ({
      source: "/:path*",
      has: [
        { type: "host", value: `${hubSlug}.climatehub.org` },
        { type: "header", key: "Accept-Language", value: "^de" },
      ],
      destination: `${BASE_URL}/de/hubs/${hubSlug}?utm_source=subdomain&utm_medium=redirect&utm_campaign=${hubSlug}`,
      permanent: false,
    })),
    ...LOCATION_HUBS.map((hubSlug) => ({
      source: "/:path*",
      has: [{ type: "host", value: `${hubSlug}.climatehub.org` }],
      destination: `${BASE_URL}/hubs/${hubSlug}?utm_source=subdomain&utm_medium=redirect&utm_campaign=${hubSlug}`,
      permanent: false,
    })),
    // 3. Main domain redirect
    {
      source: "/:path*",
      has: [{ type: "host", value: "climatehub.org" }],
      destination: `${BASE_URL}/:path*`,
      permanent: false,
    },
  ];
}

return [...domainRedirects, ...buildSubdomainRedirects(), ...existingRedirects];
```

**Note on destination URLs**: Pre-switch, the destination uses `${BASE_URL}` (which is `climateconnect.earth` in production). Post-switch, the destination is hardcoded to `https://climatehub.org` since that is the new canonical domain and `BASE_URL` will still point to the old domain until the env var is updated separately.

### Testing

```bash
# Pre-switch (CLIMATEORG_ACTIVE not set or "false")

# Main domain redirect
curl -I -H "Host: climatehub.org" http://localhost:3000/some/path
# Expected: 302 → http://localhost:3000/some/path

# Subdomain redirect (German)
curl -I -H "Host: erlangen.climatehub.org" -H "Accept-Language: de" \
  http://localhost:3000/anything
# Expected: 302 → /de/hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen

# Subdomain redirect (English fallback)
curl -I -H "Host: erlangen.climatehub.org" \
  http://localhost:3000/anything
# Expected: 302 → /hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen

# Potsdam project shortcut on new domain
curl -I -H "Host: potsdam.climatehub.org" http://localhost:3000/balkonsolar
# Expected: 302 → /de/projects/potsdam-balkon-solar?hub=potsdam&utm_source=...

# Existing subdomain redirect (English, path dropped)
curl -I -H "Host: erlangen.climateconnect.earth" \
  http://localhost:3000/anything
# Expected: 301 → /hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen

# Existing static redirect still works
curl -I http://localhost:3000/spenden
# Expected: 301 → /de/donate

# Post-switch (set CLIMATEORG_ACTIVE="true" in .env, restart)

# Main domain redirect (reversed, path preserved)
curl -I -H "Host: climateconnect.earth" http://localhost:3000/some/path
# Expected: 301 → https://climatehub.org/some/path

# Subdomain redirect (reversed, path dropped)
curl -I -H "Host: erlangen.climateconnect.earth" -H "Accept-Language: de" \
  http://localhost:3000/anything
# Expected: 301 → https://climatehub.org/de/hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen
```
