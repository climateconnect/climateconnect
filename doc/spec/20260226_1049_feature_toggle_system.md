# Feature Toggle System

**Status**: READY (Reference: [`task-based-development.md`](../guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-02-26 10:49
**Date Completed**: TBD
**Related GitHub Issue**: #40 - [STORY] Feature toggle
**Related Specs**: 
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)

## Problem Statement

As an admin and developer, I want to use feature toggles in the frontend and backend so that I can develop new features and change features without breaking the existing application.

**Core Requirements (User/Stakeholder Stated):**
- Can be used by server-side frontend
- Can be used by client-side frontend
- Can be used by Django backend
- Does not require application restarts or redeployment
- Support the setup with production/staging (slot1) using the same database
- It is possible to write frontend and backend tests that also use the feature toggle
- Use the Django admin to manage feature toggles.
- Log or audit feature toggle changes.

### Non Functional Requirements

- There is minimal impact on the performance, the result can be cached (frontend/backend).

### AI Agent Insights and Additions

**Additional Technical Considerations:**
- The feature toggle should have a boolean state.
- The feature toggle can specify which environments it applies to (production, staging, development), including a combination of those.
- The code that uses the feature toggle should have a fallback, e.g. default to false.

## System impact
- **Actors involved**: 
  - `Admin`: Manages feature toggles via the Django admin interface.
  - `System`: Reads toggle states to conditionally enable/disable functionality.
  - `Developer`: Implements code that respects feature toggles.
- **Actions to implement**:
  - `Admin` → `Manage Feature Toggle` → `FeatureToggle`
  - `System` → `Read Feature Toggle State` → `FeatureToggle`
- **Flows affected**: 
  - **New Flow**: A new `Manage Feature Toggles` flow will be created for admins.
  - **All Existing Flows**: Potentially all flows can be affected, as any feature within them could be placed behind a toggle.
- **Entity changes needed**: Yes
  - **New Entity**: `FeatureToggle` (name, production_is_active, staging_is_active, development_is_active).
- **Flow changes needed**: Yes, a new administration flow is required.
- **Integration changes needed**: Yes, integration with a caching layer (Redis) is required to ensure performance.
- **New specifications required**: 
  - `docs/mosy/entities/feature-toggle-entity.md`
  - `docs/mosy/flows/manage-feature-toggles-flow.md`

## Software Architecture
### API
A new API endpoint will be created for the frontend to fetch the current state of all feature toggles for a **specific environment provided by the client**. This endpoint will be heavily cached.

- `GET /api/feature_toggles/?environment=<env>`
  - **Parameter**: `environment` (string, required) - e.g., 'production', 'staging', 'development'.
  - **Behavior**: The backend uses the provided `environment` parameter to return only the toggles active for that specific environment. If the parameter is missing, it should return an error or an empty set.
  - **Response**: A JSON object with key-value pairs, where the key is the toggle name and the value is its boolean state. `{"FEATURE_A": true, "FEATURE_B": false}`

### Backend
- A new Django app, `feature_toggles`, will be created.
- This app will contain the `FeatureToggle` model. The `FeatureToggle` model will include a boolean field per environment (`production_is_active`, `staging_is_active`, `development_is_active`).
- The model will be registered with the Django Admin for management.
- When a `FeatureToggle` is created or updated via the admin, a log entry will be written using Django's standard logging framework to capture the change (e.g., in the `save_model` method of the `ModelAdmin`).
- The API view for `GET /api/feature_toggles/` will require the `environment` query parameter.
- The utility service/function (e.g., `is_feature_enabled('MY_FEATURE', environment)`) for use within Django will accept the environment as an argument. It will:
  1. Query the `FeatureToggle` model for the given feature name.
  2. Return `true` only if the corresponding environment-specific boolean (e.g., `production_is_active`) is `true`.
  3. Default to `false` if the toggle does not exist.
  4. Cache the result based on both the feature name and the environment.

### Data
- A new table will be added to the PostgreSQL database corresponding to the `FeatureToggle` model.
- The `featuretoggle` table will have columns like `name` (string), `production_is_active` (boolean), `staging_is_active` (boolean), `development_is_active` (boolean) and `updated_at` (timestamp).

### Frontend
- A client-side service will be created to fetch and cache the feature toggle states.
- **Environment Detection**: The service must determine the current environment dynamically at runtime. Since the app is deployed to Azure with deployment slots (production + staging using the same database), use **host-based detection**:
  - On the **client-side**: Use `window.location.hostname` to detect if the request is to the staging slot (e.g., hostname contains 'staging' or 'slot1').
  - On the **server-side** (SSR): Use the request headers.
  - Default to `'production'` if the hostname does not match a known staging or local pattern.
- It will call the API with the correct environment: `GET /api/feature_toggles/?environment=production`.
- It will provide a simple function for components to check if a feature is enabled, e.g., `isFeatureEnabled('FEATURE_A')`.
- It needs to work with server side and client side next.js code.
- It needs to handle a fallback value if the API is not available or returns an error, e.g., `isFeatureEnabled('FEATURE_A', true)`.
- Needs to support unit tests, e.g. offering a mock implementation for testing purposes.

## Technical Solution Overview
[To be filled by a development agent]

## Log
- 2026-02-26 10:49 - Task created.
- 2026-02-26 10:55 - Handing off to @mosy-system-architect for system impact analysis.

## Acceptance Criteria

- [ ] User can create a feature toggle and give it a name.
- [ ] The feature toggle has a boolean state per environment (production, staging, development).
- [ ] Feature toggles are managed via the Django Admin interface.
- [ ] Feature toggle changes are logged/audited.
- [ ] Feature toggles do not require application restarts or redeployment to take effect.
- [ ] The code that uses the feature toggle has a fallback, e.g. default to false.
- [ ] Feature toggles work in both server-side and client-side Next.js code.
- [ ] Feature toggles can be tested via mock implementations in frontend and backend tests.
- [ ] There is minimal impact on the performance, the result can be cached (frontend/backend).
- [ ] All tests pass (unit, integration, end-to-end)
- [ ] Code review approved
- [ ] Performance benchmarks met
- [ ] Security review passed
- [ ] Documentation updated and current

