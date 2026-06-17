# Handle Climate Hub Subdomain Redirects

**Date**: 2026-06-17  
**Status**: DRAFT  
**Type**: Frontend — feature  
**GitHub Issue**: [#2066](https://github.com/climateconnect/climateconnect/issues/2066)

---

## Problem Statement

Climate Connect serves three location hubs (Erlangen, Marburg, Potsdam) on their own subdomains (e.g. `erlangen.climateconnect.earth`). These subdomains are currently redirected to the main domain's hub pages via nginx rewrite rules. The nginx configuration only handles those three specific subdomains and cannot be extended to new location hubs without manual nginx changes.

### Why it matters

- **Does not scale**: The nginx rewrites are hardcoded for three hubs. Adding a new location hub requires a separate nginx configuration change and redeployment. With the Next.js `redirects()` configuration, this can be made dynamic based on the `LOCATION_HUBS` environment variable.
- **Extra infrastructure cost and maintenance**: The nginx redirect layer runs as a separate service that must be provisioned, monitored, and maintained. Moving the redirects into Next.js eliminates this infrastructure component entirely.
- **Potsdam-specific project shortcuts**: Potsdam has additional nginx redirects for direct project paths (`/balkonsolar`, `/stadtacker`, `/fassadenbegrünung`). These community-facing shortcuts need to be preserved.

### Current state

- The nginx rewrite rules are active and working. Subdomain requests are successfully redirected via the nginx service.
- `LOCATION_HUBS` is an existing comma-separated environment variable (e.g. `"erlangen,marburg,potsdam"`) already parsed and available in `next.config.js` via `pick(process.env, [...])`.
- Next.js `i18n` is configured with `locales: ["en", "de"]` and `defaultLocale: "en"`.
- Hub pages exist at `/hubs/{slug}` (both dynamic routes under `pages/hubs/[hubUrl]/` and static routes for known hubs like `pages/hubs/erlangen/`).
- The `redirects()` function in `frontend/next.config.js` already handles several URL redirects.

---

## Scope

### In scope

1. Dynamic subdomain redirects for all location hubs listed in the `LOCATION_HUBS` environment variable.
2. Language-aware redirects: German (`Accept-Language` starts with `de`) visitors go to `/de/hubs/{slug}`, others go to `/en/hubs/{slug}`.
3. Potsdam-specific project path redirects (`/balkonsolar`, `/stadtacker`, `/fassadenbegrünung`).
4. All Potsdam project redirects point to the German locale path (`/de/projects/...`) with a `hub=potsdam` query parameter.

### Out of scope (for now)

- Dynamic DNS or wildcard subdomain setup (handled by infrastructure/DNS, not by this spec).
- Subdomain-based routing for custom hubs (e.g. `prio1.climateconnect.earth`) — custom hubs live on separate external domains.
- A UI or backend admin panel for managing subdomain redirects — Potsdam's project shortcuts are hardcoded for now.
- Changing the `LOCATION_HUBS` environment variable values or adding new hub slugs — that is a separate operational task.

---

## Acceptance Criteria

### AC-1: Generic subdomain redirect for any location hub

Given a visitor navigates to `{hubSlug}.climateconnect.earth` (where `hubSlug` is one of the slugs in `LOCATION_HUBS`):

- If their `Accept-Language` header starts with `de`, they are redirected (302) to `https://climateconnect.earth/de/hubs/{hubSlug}?utm_source=subdomain&utm_medium=redirect&utm_campaign={hubSlug}`.
- Otherwise, they are redirected (302) to `https://climateconnect.earth/en/hubs/{hubSlug}?utm_source=subdomain&utm_medium=redirect&utm_campaign={hubSlug}`.
- Any path on the subdomain (e.g. `erlangen.climateconnect.earth/some/path`) redirects to the hub root page (the path is not preserved).
- UTM parameters are appended to all subdomain redirect destinations for traffic attribution in Google Analytics.

### AC-2: Redirects are dynamic based on LOCATION_HUBS

Adding or removing a slug from the `LOCATION_HUBS` environment variable and redeploying automatically adds or removes the corresponding subdomain redirects. No code change is needed.

### AC-3: Potsdam project redirects work

The following Potsdam-specific redirects are defined (all permanent — 301):

| Source path (on `potsdam.climateconnect.earth`) | Destination |
|---|---|
| `/balkonsolar` | `https://climateconnect.earth/de/projects/potsdam-balkon-solar?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=balkonsolar` |
| `/stadtacker` | `https://climateconnect.earth/de/projects/stadtacker-eine-bildungsgartnerei-der-zukunft-fur-potsdam?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=stadtacker` |
| `/fassadenbegrünung` | `https://climateconnect.earth/de/projects/stadtgrun-fassadenbegrunung?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=fassadenbegruenung` |

These are permanent redirects (301) because the project URLs are stable.

### AC-4: Potsdam project redirects take precedence over generic hub redirect

When a visitor goes to `potsdam.climateconnect.earth/balkonsolar`, they are redirected to the project page (AC-3), NOT to the Potsdam hub page (AC-1). The Potsdam-specific redirects are defined before the generic subdomain redirects in the `redirects()` array so Next.js matches them first.

### AC-5: Existing redirects are not broken

The existing redirects in `next.config.js` (e.g. `/spenden` → `/de/donate`, `/klimapuzzle` → etc.) continue to work unchanged. The new subdomain redirects are appended to the existing redirect list.

---

## Constraints

- **Frontend only** — this is a `next.config.js` change. No backend changes.
- **No new dependencies** — uses Next.js built-in `redirects()` with `has` conditions for host and header matching. UTM parameters are simple query string additions, no analytics library needed.
- **No new environment variables** — uses the existing `LOCATION_HUBS` env var.
- **`BASE_URL` environment variable** — the redirect destination URLs should use `process.env.BASE_URL` (already available in `next.config.js` via `pick`) rather than being hardcoded to `https://climateconnect.earth`. This ensures the configuration works across production, staging, and development environments.
- **UTM parameters replace `from_subdomain`** — the old nginx rewrite included a `from_subdomain` query parameter that was never consumed by the application. UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) provide structured traffic attribution that Google Analytics natively interprets.
- **302 for generic subdomain redirects** — the generic hub redirects are temporary (302) because the hub landing page may change (e.g. hub could be removed or restructured). 302 avoids browser caching a redirect that might become stale.
- **301 for Potsdam project redirects** — the project URLs are permanent and stable, so 301 is appropriate.
- **Ordering matters** — Potsdam-specific redirects must appear before the generic `potsdam.climateconnect.earth` hub redirect so they match first.

---

## Domain Context

### How Next.js redirects with `has` conditions work

Next.js `redirects()` supports a `has` array that matches incoming requests based on host, header, cookie, or query parameter. When all `has` conditions match, the `source` → `destination` redirect is applied. This allows subdomain-based redirects without middleware.

The `has` condition with `type: "host"` matches the hostname. Combined with `type: "header"` matching `Accept-Language`, we can create language-aware redirects.

### The LOCATION_HUBS environment variable

A comma-separated string of hub slugs (e.g. `"erlangen,marburg,potsdam"`). Already parsed by `next.config.js` via `pick(process.env, [..., "LOCATION_HUBS", ...])`. In `_app.tsx` it is split into an array for React Context. In `next.config.js`, it needs to be split the same way to generate redirect entries.

### Redirect generation pattern

For each hub slug in `LOCATION_HUBS`, two redirect entries are generated:
1. German: matches `Accept-Language` header starting with `de` → `/de/hubs/{slug}?utm_source=subdomain&utm_medium=redirect&utm_campaign={slug}`
2. English fallback: no header match → `/en/hubs/{slug}?utm_source=subdomain&utm_medium=redirect&utm_campaign={slug}`

German entries come first so that German-speaking visitors get the German locale. If the header does not match `de`, the English fallback entry matches.

### UTM parameters for traffic attribution

All subdomain redirects include UTM parameters to track traffic from hub subdomains in Google Analytics:

| Parameter | Value | Purpose |
|---|---|---|
| `utm_source` | `subdomain` | Identifies traffic originating from a hub subdomain |
| `utm_medium` | `redirect` | Identifies the medium as a redirect (vs. a link, ad, etc.) |
| `utm_campaign` | `{hubSlug}` | Identifies which hub subdomain the visitor came from |
| `utm_content` | `{projectSlug}` | (Potsdam project redirects only) Identifies which specific project shortcut was used |

This replaces the old `from_subdomain` query parameter from the nginx configuration, which was never consumed by the application. UTM parameters are natively interpreted by Google Analytics and provide structured attribution data without requiring custom analytics configuration.

### The Potsdam project shortcuts

These are community-facing URLs that were shared in local communications (flyers, social media, partner websites). `balkonsolar` refers to a balcony solar project, `stadtacker` to an urban farming education project, and `fassadenbegrünung` to a facade greening project. All three are specific to the Potsdam hub and should permanently redirect to their project pages.

The `hub=potsdam` query parameter on the destination URLs is important: it tells the frontend to show the project in the context of the Potsdam hub, displaying hub-specific navigation and branding. UTM parameters are also appended for traffic attribution (see "UTM parameters for traffic attribution" below).

---

## AI Agent Insights

### Why generate redirects at build time rather than runtime

Next.js `redirects()` is evaluated at build time and compiled into the routing configuration. This means:
- No runtime overhead per request (the redirects are part of the compiled route manifest).
- The `LOCATION_HUBS` value is read once at build time. Changing the env var requires a rebuild/redeploy, which is already the case for all env vars in `next.config.js`.
- This is the idiomatic Next.js approach for subdomain redirects.

### Accept-Language regex caveat

The `has` condition for `Accept-Language` uses regex matching: `value: "^de"`. This matches any `Accept-Language` header that starts with `de`, covering `de`, `de-DE`, `de-AT`, `de-CH`, `de,en;q=0.9`, etc. This is the correct behavior — all German-speaking visitors should get the German locale.

### Edge case: LOCATION_HUBS is empty or undefined

If `LOCATION_HUBS` is not set or is an empty string, `split(",")` produces `[""]`. The generated redirects would try to match `.climateconnect.earth` (an empty subdomain), which will never match real requests. To be safe, the code should filter out empty strings after splitting.

### Edge case: hub slug with special characters

Hub slugs are URL-safe by convention (lowercase, hyphens). The Potsdam project path `/fassadenbegrünung` contains a `ü` (umlaut). In the nginx config, this was a literal path. In Next.js `redirects()`, the `source` field must match the URL as received. Browsers typically percent-encode non-ASCII characters in the path, so the source should use the encoded form or rely on Next.js's built-in normalization. The issue's example uses the literal character — Next.js handles this correctly in `redirects()` source patterns.

### No middleware needed

An alternative approach would be to use Next.js middleware to detect the subdomain and rewrite/redirect. However, `redirects()` with `has` conditions is:
- Simpler (declarative configuration vs imperative code).
- More efficient (compiled into the route manifest, not evaluated per request at runtime).
- Already the pattern used for other redirects in this codebase.

Middleware is already used for environment detection (`middleware.ts`). Adding subdomain logic there would increase its complexity and coupling.

### DNS prerequisite

DNS is already configured for the existing subdomains (erlangen, marburg, potsdam) since the nginx solution is currently live. For any new hub added to `LOCATION_HUBS`, DNS must be configured to route the subdomain to the Next.js application. This is an infrastructure concern outside this spec, but worth noting: if DNS is not set up for a hub slug in `LOCATION_HUBS`, the redirect entry is harmless (it simply never matches).

---

## Implementation Notes

### Location of changes

All changes are in `frontend/next.config.js`, inside the `redirects()` function.

### Structure

1. Parse `LOCATION_HUBS` from `process.env` into an array (filter out empty strings).
2. Generate Potsdam-specific project redirects (hardcoded array). These must come first.
3. Generate generic subdomain redirects for each hub slug (two per slug: German first, then English fallback).
4. Return the combined array: `[...potsdamProjectRedirects, ...subdomainRedirectsDe, ...subdomainRedirectsEn, ...existingRedirects]`.

### Example code from issue author (adapt as needed)

The following code snippets are from the GitHub issue. They illustrate the intended approach. The implementation agent should adjust as needed (e.g. add UTM parameters, integrate with the existing `redirects()` function, handle edge cases).

**Generic subdomain redirects (generated from LOCATION_HUBS):**

```js
const BASE_URL = process.env.BASE_URL || "https://climateconnect.earth";

// German: Accept-Language starts with "de"
const subdomainRedirectsDe = LOCATION_HUBS.map((hubSlug) => ({
  source: "/:path*",
  has: [
    { type: "host", value: `${hubSlug}.climateconnect.earth` },
    { type: "header", key: "Accept-Language", value: "^de" },
  ],
  destination: `${BASE_URL}/de/hubs/${hubSlug}`,
  permanent: false,
}));

// English fallback: catches everything else
const subdomainRedirectsEn = LOCATION_HUBS.map((hubSlug) => ({
  source: "/:path*",
  has: [{ type: "host", value: `${hubSlug}.climateconnect.earth` }],
  destination: `${BASE_URL}/en/hubs/${hubSlug}`,
  permanent: false,
}));
```

**Potsdam-specific project redirects (must be defined before the generic subdomain redirects):**

```js
{
  source: "/balkonsolar",
  has: [{ type: "host", value: "potsdam.climateconnect.earth" }],
  destination: `${BASE_URL}/de/projects/potsdam-balkon-solar?hub=potsdam`,
  permanent: true,
},
{
  source: "/stadtacker",
  has: [{ type: "host", value: "potsdam.climateconnect.earth" }],
  destination: `${BASE_URL}/de/projects/stadtacker-eine-bildungsgartnerei-der-zukunft-fur-potsdam?hub=potsdam`,
  permanent: true,
},
{
  source: "/fassadenbegrünung",
  has: [{ type: "host", value: "potsdam.climateconnect.earth" }],
  destination: `${BASE_URL}/de/projects/stadtgrun-fassadenbegrunung?hub=potsdam`,
  permanent: true,
},
```

**Combining with existing redirects:**

```js
const redirects = [
  ...potsdamProjectRedirects,
  ...subdomainRedirectsDe,
  ...subdomainRedirectsEn,
  // ... existing redirects
];
```

Note: The example code above does not include UTM parameters. The implementation agent must add them as specified in the acceptance criteria.

### BASE_URL usage

All redirect destinations use `${BASE_URL}/...` where `BASE_URL = process.env.BASE_URL || "https://climateconnect.earth"`. This is consistent with the pattern suggested in the issue and ensures portability across environments.

### Testing

Manual verification:
- Set `LOCATION_HUBS=erlangen,marburg,potsdam` and `BASE_URL=https://climateconnect.earth` in the frontend `.env`.
- Run `yarn dev` (or `yarn build && yarn start`).
- Test with `curl -H "Host: erlangen.climateconnect.earth" http://localhost:3000/` — should get a 302 to `/de/hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen` or `/en/hubs/erlangen?utm_source=subdomain&utm_medium=redirect&utm_campaign=erlangen` depending on `Accept-Language`.
- Test `curl -H "Host: potsdam.climateconnect.earth" -H "Accept-Language: de" http://localhost:3000/balkonsolar` — should get a 301 to `/de/projects/potsdam-balkon-solar?hub=potsdam&utm_source=subdomain&utm_medium=redirect&utm_campaign=potsdam&utm_content=balkonsolar`.
- Verify existing redirects still work: `curl http://localhost:3000/spenden` → 301 to `/de/donate`.
