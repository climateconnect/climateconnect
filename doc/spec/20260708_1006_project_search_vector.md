# Project Search: Language-Scoped Multi-Field Full-Text Search

**Date**: 2026-07-08
**Status**: DRAFT
**Type**: Enhancement — backend (API + data model)

---

## Problem Statement

Searching for projects on the browse/project-list pages is currently limited and behaves incorrectly:

1. **Single-field, substring-only matching.** The project list endpoint (`ListProjectsView`, `backend/organization/views/project_views.py:166`) uses DRF's `SearchFilter` over only `name` and `translation_project__name_translation` with case-insensitive `icontains`. It cannot match the project's short description, sector, or location, and substring matching gives poor relevance ranking (no word/stem awareness).

2. **Language-incorrect results.** `translation_project__name_translation` matches across *all* translations regardless of language. A user browsing in German can get hits on an English-only project name simply because the substring appears in some translation row. Search is not scoped to the user's language.

3. **Join-heavy query path.** Every search request joins the translation, sector-mapping, and location-translation tables at query time, which is the source of the complexity and a performance liability as the project catalogue grows.

### Current behavior

- Endpoint: `GET /api/projects/` → `ListProjectsView` with `filter_backends = [SearchFilter, DjangoFilterBackend, ProjectsOrderingFilter]` and `search_fields = ["name", "translation_project__name_translation"]`.
- The same `name` + `name_translation` pattern is repeated in `ListEventsView` (`project_views.py:439`) and manually in `EventCalendarCountsView` (`project_views.py:597-600`).
- Searchable text is limited to the project name (base + translated). Description, sector name, and location name are not searched.
- There is no language parameter; the searched translation table is not filtered by `language`.
- Sectors are stored as `Sector.name` + `Sector.name_de_translation` columns (not a translation table); locations use a proper `LocationTranslation` table with a `language` FK. The two translation shapes differ and both must be covered.

### Desired behavior

- A user can search projects by a free-text term and get relevant matches across **name, short description, sector, and location**, ranked by relevance.
- The search is **scoped to the user's selected language**: only text in that language is matched. When a translation in the requested language is missing, the search falls back to the default language so projects are not silently dropped. The language is taken from the existing request-language mechanism (`Accept-Language` header → `request.LANGUAGE_CODE`, set by Django's `LocaleMiddleware`) — the same mechanism the rest of the API already uses — not from a new query parameter.
- The search executes against a **precomputed, indexed search document** rather than joining translation/sector/location tables on every request.
- The same capability is available to the event-list and event-calendar endpoints so behavior is consistent.
- No new external infrastructure (e.g. Elasticsearch) is introduced — the solution stays within the existing PostgreSQL stack.

---

## Acceptance Criteria

### Search coverage & relevance
1. A free-text search matches projects whose **name**, **short description**, **sector name**, or **location name** contain the term (language-scoped — see below).
2. Results are ordered by relevance (best match first), not merely by ID/date.
3. Substring/partial-word and basic stemming behavior is reasonable for the supported languages (e.g. searching "energy" also ranks "energies" appropriately).

### Language scoping
4. Search derives the language from the existing request-language mechanism (`Accept-Language` header → `request.LANGUAGE_CODE`, via `LocaleMiddleware`) — the same mechanism the rest of the API uses (e.g. `get_language_code_from_context`). No new language query parameter is introduced. Only that language's text is searched.
5. When a project has no translation in the requested language, the search falls back to the default language so the project remains findable by its base/translated name and description.
6. A German search does **not** return a project merely because the substring appears in an unrelated-language translation row.

### Performance & data model
7. The search query does **not** join the translation, sector-mapping, or location-translation tables at request time for the text match.
8. The search document is **maintained automatically** whenever a relevant source field changes (project create/update, translation add/update, sector reassign, location change) so it never goes stale.
9. An appropriate index backs the search column so queries remain fast as the catalogue grows.

### Consistency & safety
10. The event-list and event-calendar endpoints expose the same language-scoped, multi-field search behavior.
11. No regression to existing filters (`sectors`, `hub`, `collaboration`, location radius, date range) or to pagination/permissions.
12. Drafts remain excluded; existing `is_active`/`is_draft` rules unchanged.

---

## Constraints

- **No new infrastructure.** The solution must run entirely on the existing PostgreSQL (PostGIS) database. External search services (Elasticsearch, Meilisearch, Typesense, etc.) are explicitly out of scope.
- **PostgreSQL only.** The chosen mechanism must be a native PostgreSQL capability (full-text search / `tsvector`, GIN indexing, generated/trigger-maintained columns).
- **Translation data shapes differ.** Sector names live as `name` + `name_de_translation` columns on `Sector`; location names live in a `LocationTranslation` table keyed by `language`; project name/short-description live both on `Project` (base/default) and in `ProjectTranslation` (per `language`). The search document must reconcile these three shapes into one language-scoped document.
- **Existing endpoints must keep working.** `ListProjectsView`, `ListEventsView`, and `EventCalendarCountsView` all depend on the current `search` param and should continue to accept it.
- **Backward compatibility of the API contract.** The `?search=` query parameter and its meaning (free-text filter) should be preserved; this is an internal improvement to *how* search works, not a change to the public contract.
- **Reuse the existing language mechanism.** Language must be resolved from `request.LANGUAGE_CODE` (populated by `LocaleMiddleware` from the `Accept-Language` header), consistent with `get_language_code_from_context`. Do **not** introduce a new `?language=` query parameter; the search should behave like the rest of the API with respect to language.

---

## AI Insights

- **Recommended direction (medium-term):** maintain a **precomputed, language-scoped search document** stored as a dedicated column on the project (one document per supported language, or a single document built for the requested language), backed by a GIN index. At request time the endpoint filters against that indexed column instead of joining translation/sector/location tables. This removes the join complexity and gives relevance ranking for free.
- **Why not substring `icontains`:** it cannot rank by relevance and forces per-field OR-joins. PostgreSQL full-text search (`tsvector`/`tsquery`) provides stemming, weight, and `ts_rank` relevance ordering natively.
- **Language handling is the crux.** Because translations are per-language rows, the document must be built *per language* (with fallback to the default language when a translation is absent). A single language-agnostic document would reintroduce the cross-language false-match bug.
- **Language is already available on the request.** `LocaleMiddleware` is enabled (`settings.py:107`), so `request.LANGUAGE_CODE` is set from the `Accept-Language` header — the same source `get_language_code_from_context` (`location/utility.py:161`) uses for serializers. The search endpoint should read `request.LANGUAGE_CODE` directly rather than re-deriving language, keeping it consistent with the rest of the API and avoiding a new query param.
- **Maintenance is the main engineering risk.** The document must be regenerated whenever any contributing field changes — project fields, any `ProjectTranslation` for that language, sector mappings, or the location. A DB-level mechanism (generated column / trigger) is more robust than application-level save hooks, which can miss bulk updates or related-model changes. The exact mechanism is an architecture decision (see System Impact).
- **Two translation shapes for sectors vs locations** mean the document-builder needs distinct logic per source; this is the trickiest part of keeping the document correct.
- **Scope to the three endpoints.** All three (`ListProjectsView`, `ListEventsView`, `EventCalendarCountsView`) currently repeat the `name`/`name_translation` search; consolidating them onto the shared document is the clean win.
- **Migration backfill.** Introducing the column requires a one-time backfill that builds documents for all existing projects/languages; plan for this in the migration.

---

## System Impact (pending — architect handoff)

> To be completed during the IMPLEMENTATION handoff. Covers: exact column design (per-language vs on-demand), trigger vs generated-column vs signal strategy, GIN index definition, migration/backfill plan, and effects on write-path latency for project/translation/sector/location mutations.
