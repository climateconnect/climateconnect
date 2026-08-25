# OpenAPI Code Generation: Typed API Layer

**Status**: DRAFT
**Type**: Infrastructure / Refactoring
**Date and time created**: 2026-05-27 13:25 UTC
**Date Completed**: TBD
**GitHub Issue**: TBD
**Related Specs**:
- [`doc/spec/20260326_1030_form_validation_zod_react_hook_form.md`](./20260326_1030_form_validation_zod_react_hook_form.md)

## Problem Statement

The Climate Connect frontend hand-writes all API types, request functions, and deserialization logic. The `Project` type in `types.ts` is the most visible symptom: it is a single catch-all interface with 30+ optional fields because different project types (event, idea, project) carry different data, and API fields get mixed with UI-only state (`registrationEnabled`, `registration_config`, etc.).

**Observed pain points:**

- **Type drift**: Adding a field to a Django model/serializer requires manually updating the frontend `Project` type, the `parseProject` function, and every place that spreads or destructures the object. There is no compile-time check that the frontend matches the backend schema.
- **Ad-hoc deserialization**: API responses are passed through raw. Date fields arrive as ISO 8601 strings but the `Project` type declares them as `Date | Dayjs | null`. Every consumer individually wraps with `dayjs()` or `new Date()` — scattered across 15+ call sites — with no single source of truth for the conversion.
- **Mixed concerns**: The `Project` type conflates API response shapes with form state (`registration_end_date?: Dayjs | null`), UI flags (`is_draft?`, `registrationEnabled?`), and navigation data (`hubUrl?`, `related_hubs?`). This makes it unclear which fields come from the API and which are client-only.
- **No request validation**: Axios calls use untyped payloads (`Record<string, unknown>`). Response shapes are assumed, not verified. A backend field rename silently breaks the frontend at runtime.
- **Incomplete OpenAPI annotations**: `drf-spectacular` is installed and configured, but only 3 auth endpoints out of ~50+ have `@extend_schema` decorators. The schema at `/api/schema/` is auto-generated from serializer introspection — functional but imprecise (no tags, no response descriptions, no error schemas).

**Core Requirements:**

1. Annotate all Django REST Framework viewsets and API views with `@extend_schema` so the OpenAPI schema at `/api/schema/` is complete and accurate (tags, request/response schemas, error responses).
2. Add a Makefile target to export a static `schema.yaml` file from the backend.
3. Choose a frontend codegen tool and generate TypeScript types + typed API client functions from the static schema.
4. Separate generated API types from UI/view-model types. Generated types represent what the API sends/receives. UI-only state lives in separate, hand-written types.
5. Replace the current ad-hoc `apiRequest` calls with the generated typed client.
6. Remove the hand-written type definitions that are now generated.

**Explicitly Out of Scope (this iteration):**

- Changing runtime behavior of any endpoint.
- Migrating form validation (covered by the Zod + React Hook Form spec).
- Refactoring the `Project` monolith into domain-specific types (e.g. `ProjectEvent`, `ProjectIdea`) — this follows naturally once types are generated but is a separate task.
- Changing how SSR (`getServerSideProps`) fetches data — the generated client can be adopted there incrementally.

### Non Functional Requirements

- Generated code must be committed to the repo (not a build-time dependency) so that contributors can work without running the backend.
- Schema export + codegen must run in under 30 seconds total.
- All existing `yarn lint`, `yarn format`, and TypeScript checks must continue to pass.
- The codegen tool must support OpenAPI 3.0 (what drf-spectacular produces).
- Generated types must be clearly separated in a `generated/` directory so humans know not to edit them manually.

### AI Agent Insights and Additions

- **Tool choice — `openapi-typescript` vs `orval`**: `openapi-typescript` generates only types (no runtime client), keeping the bundle small and letting the team choose their own fetch layer. `orval` generates full Axios hooks with React Query integration — more opinionated but eliminates boilerplate. Given that Climate Connect already uses Axios and has no React Query, `openapi-typescript` + a thin typed Axios wrapper is the lower-risk starting point. `orval` can be evaluated later if the team wants React Query.
- **`COMPONENT_SPLIT_REQUEST: true`** is already set in `SPECTACULAR_SETTINGS`. This means drf-spectacular generates separate schemas for request and response bodies — important for codegen because it avoids the common problem of read-only fields appearing in generated create/update types.
- **Serializer `source` mappings**: Several DRF serializers use `source=` to rename fields (e.g. `url_slug` sourced from `project_url_slug`). The OpenAPI schema will reflect the serialized name, not the model field name — this is correct for codegen but worth documenting so developers don't confuse the two.
- **Nested serializers**: The `Project` serializer nests `team_members`, `project_parents`, `sectors`, etc. The generated types will reflect these as nested objects. This is an improvement over the current `any[]` typing but will require type narrowing at consumption sites.
- **Incremental adoption**: The generated client can coexist with the existing `apiRequest` function. Endpoints can be migrated one at a time, starting with the most-used ones (project detail, registration config, browse/filter).
- **Schema quality**: The biggest upfront investment is annotating endpoints with `@extend_schema`. Without this, the generated types will work but will lack discriminated unions for error responses, descriptions for fields, and proper tags for grouping. The auth endpoints already have good annotations — use those as the template.
- **Date handling**: The generated types will have `start_date: string` (from the ISO serializer). A thin layer can provide `dayjs()` conversion helpers that are used consistently, replacing the current 15+ ad-hoc `dayjs()` calls. This connects to the earlier discussion about deserializing dates in a single place.

## System Impact

*To be filled during system impact analysis.*

Key areas to assess:
- Backend: All viewsets and API views need `@extend_schema` annotations (effort, not behavior change).
- Frontend: New `generated/` directory, new typed client module, migration of ~50+ `apiRequest` call sites.
- CI: A step to regenerate the schema and verify committed types are up to date.

## Software Architecture

### Backend: Schema Export Pipeline

```
Django Models → DRF Serializers → @extend_schema annotations → drf-spectacular → /api/schema/
                                                                         ↓
                                                              make export-schema
                                                                         ↓
                                                              backend/schema.yaml (committed)
```

The schema file is committed to the repo. A CI check verifies it is up to date (`manage.py spectacular --check`).

### Frontend: Codegen Pipeline

```
backend/schema.yaml → openapi-typescript → frontend/src/api/generated/
                                            ├── types.ts          # all API types
                                            └── (future: client.ts # typed Axios wrapper)
```

### Separation of Concerns

```
┌─────────────────────────────────────────────────┐
│  Generated (from OpenAPI schema)                │
│  src/api/generated/types.ts                     │
│  - ProjectApiType                               │
│  - EventRegistrationDataApiType                 │
│  - RegistrationFieldApiType                     │
│  - All request/response shapes                  │
├─────────────────────────────────────────────────┤
│  Hand-written (UI/view-model)                   │
│  src/types.ts                                   │
│  - Project (extends/generated from ProjectApiType)│
│  - RegistrationFieldAnswerValue (form state)    │
│  - UI-only flags (registrationEnabled, etc.)    │
├─────────────────────────────────────────────────┤
│  API Client                                     │
│  src/api/client.ts                              │
│  - Typed wrapper around Axios                   │
│  - Uses generated types for request/response    │
│  - Replaces apiRequest calls incrementally      │
└─────────────────────────────────────────────────┘
```

### Affected Files

| Area | File(s) | Change |
|------|---------|--------|
| Backend | `organization/views/project*.py` | Add `@extend_schema` decorators |
| Backend | `auth_app/views.py` | Already annotated — review/enhance |
| Backend | `chat/views/`, `hubs/views/`, `ideas/views/`, etc. | Add `@extend_schema` decorators |
| Backend | `Makefile` | Add `export-schema` target |
| Backend | `schema.yaml` | New — committed static schema |
| Frontend | `package.json` | Add `openapi-typescript` devDependency |
| Frontend | `src/api/generated/types.ts` | New — generated types (committed) |
| Frontend | `src/api/client.ts` | New — typed Axios wrapper |
| Frontend | `src/types.ts` | Refactor to extend/re-export generated types |
| Frontend | `src/apiOperations.ts` | Deprecate `apiRequest` in favour of typed client |
| Frontend | Various components using `apiRequest` | Migrate incrementally |
| CI | `.github/workflows/` | Add schema freshness check |

### Implementation Phases

#### Phase 1 — Backend Schema Completeness

Annotate all viewsets and API views with `@extend_schema`. Use the auth endpoints (`auth_app/views.py`) as the template.

Priority order:
1. Project/Organization views (most-used, most complex serializers)
2. Event registration views
3. Browse/filter/search views
4. Chat, hubs, ideas, climate match
5. Remaining utility endpoints

Each view gets:
- `@extend_schema(tags=[...])` for Swagger grouping
- `@extend_schema(request=..., responses=...)` where serializer introspection is insufficient
- Error response documentation (`400`, `401`, `403`, `404`) on key endpoints

#### Phase 2 — Schema Export

Add to `backend/Makefile`:
```makefile
export-schema:
	pdm run python manage.py spectacular --file schema.yaml --validate
```

Add to root `Makefile`:
```makefile
export-schema:
	$(MAKE) -C backend export-schema
```

Commit `backend/schema.yaml`. Add a CI step:
```yaml
- name: Verify OpenAPI schema is up to date
  run: cd backend && pdm run python manage.py spectacular --check
```

#### Phase 3 — Frontend Codegen

Install `openapi-typescript`:
```bash
yarn add -D openapi-typescript
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "generate-api-types": "openapi-typescript ../backend/schema.yaml -o src/api/generated/types.ts"
  }
}
```

Run codegen and commit the generated file. Verify it compiles.

#### Phase 4 — Typed API Client

Create `src/api/client.ts` — a thin typed wrapper around Axios:
```typescript
import axios, { AxiosRequestConfig } from "axios";
import type { paths } from "./generated/types";

// Helper to extract response type from the generated paths type
type GetResponse<TPath extends keyof paths, TMethod extends "get" | "post"> =
  paths[TPath][TMethod] extends { responses: infer R }
    ? R extends { 200: { content: { "application/json": infer T } } }
      ? T
      : never
    : never;

export async function apiGet<TPath extends keyof paths>(
  url: TPath,
  config?: AxiosRequestConfig
): Promise<GetResponse<TPath, "get">> {
  const resp = await axios.get(url as string, config);
  return resp.data;
}
```

The exact shape depends on what `openapi-typescript` generates — refine after Phase 3 output is available.

#### Phase 5 — Incremental Migration

Migrate endpoints from `apiRequest` to the typed client, starting with:
1. `GET /api/projects/{slug}/` (project detail)
2. `GET/PATCH /api/projects/{slug}/registration-config/` (event registration)
3. `GET /api/projects/` (browse/list)
4. Remaining endpoints

Each migration:
- Replaces `apiRequest({ method, url, payload, token, locale })` with typed client call
- Removes hand-written type assertion after the call
- Can be done one endpoint at a time, independently deployable

#### Phase 6 — Type Consolidation

- Update `src/types.ts` to import and extend generated types for UI-only fields
- Remove hand-written API response types that are now generated
- Add a `dayjs` conversion layer for date fields (single place instead of 15+ scattered calls)
- Update `CONTRIBUTING.md` with the new API integration patterns

### Before / After Pattern

**Before (current):**
```typescript
// types.ts — hand-written, 30+ optional fields, mixed concerns
export type Project = {
  id?: number;
  name?: string;
  start_date?: Date | Dayjs | null;  // actually string from API
  end_date?: Date | Dayjs | null;    // actually string from API
  registrationEnabled?: boolean;      // UI-only
  // ... 25 more fields
};

// apiOperations.ts — untyped
const resp = await apiRequest({ method: "get", url: `/api/projects/${slug}/`, token });
const project = resp.data as Project;  // unsafe cast

// Component — ad-hoc date conversion
dayjs(project.start_date)  // repeated 15+ times
```

**After (target):**
```typescript
// api/generated/types.ts — generated from OpenAPI, never hand-edited
export type components = {
  schemas: {
    Project: {
      id: number;
      name: string;
      start_date: string;  // ISO 8601, matches API
      end_date: string;    // ISO 8601, matches API
      // ... all fields, correct optionality
    };
  };
};

// api/client.ts — typed
const project = await apiGet(`/api/projects/${slug}/`);
// project is fully typed, no cast needed

// types.ts — UI extensions only
import type { components } from "../api/generated/types";
export type Project = components["schemas"]["Project"] & {
  registrationEnabled?: boolean;  // UI-only, clearly separated
};
```

## Acceptance Criteria

1. `make export-schema` produces a valid OpenAPI 3.0 YAML file from the running backend.
2. `yarn generate-api-types` produces TypeScript types from the schema file.
3. CI verifies the committed schema and generated types are up to date.
4. At least 5 endpoints are migrated to the typed client as proof of concept.
5. No runtime behavior changes — all existing tests pass.
6. `yarn lint` and `yarn format` pass with no errors.

## Log

| Date | Entry |
|------|-------|
| 2026-05-27 13:25 UTC | Task created from discussion about Project type drift and date handling |
