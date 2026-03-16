# Feature Toggle Entity

## Overview

The `FeatureToggle` entity provides a mechanism to enable or disable features across different deployment environments without requiring code changes or redeployment.

## Purpose

- Enable gradual rollout of new features
- Allow feature testing in specific environments before production
- Provide emergency kill switches for problematic features
- Support A/B testing and conditional feature availability

## Model Definition

**App**: `feature_toggles`  
**Database Table**: `feature_toggle`

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | BigAutoField | Primary key |
| `name` | CharField(128) | Unique identifier (uppercase, underscores) |
| `description` | TextField | Human-readable description |
| `production_is_active` | BooleanField | Feature enabled in production |
| `staging_is_active` | BooleanField | Feature enabled in staging |
| `development_is_active` | BooleanField | Feature enabled in development |
| `created_at` | DateTimeField | Creation timestamp |
| `updated_at` | DateTimeField | Last modification timestamp |

### Constraints

- `name` must be unique
- `name` must match pattern: `^[A-Z0-9_]+$`

## API Usage

### Get All Toggles for Environment

```
GET /api/feature_toggles/?environment=<env>
```

**Query Parameters:**
- `environment` (required): One of `production`, `staging`, `development`

**Response:**
```json
{
  "FEATURE_A": true,
  "FEATURE_B": false
}
```

**Error Responses:**
- 400: Missing or invalid environment parameter

## Django Backend Usage

### Check Feature Toggle

```python
from feature_toggles.utility import is_feature_enabled

# Check if feature is enabled
if is_feature_enabled('MY_FEATURE', 'production'):
    # Feature is active
    pass
```

### Utility Functions

| Function | Description |
|----------|-------------|
| `is_feature_enabled(name, env, default=False)` | Check single toggle |
| `get_all_toggles_for_environment(env)` | Get all toggles as dict |
| `invalidate_feature_cache(name=None, env=None)` | Clear cache |

### Caching

- Results are cached in Redis for 5 minutes
- Cache key format: `feature_toggle_{environment}_{feature_name}`

## Django Admin

Feature toggles can be managed via Django Admin at `/admin/feature_toggles/featuretoggle/`

- Create, update, and delete toggles
- All changes are logged for audit purposes
- Timestamps are read-only

## Environment Detection

The system supports three environments:

1. **production**: Live production environment
2. **staging**: Staging/slot1 environment  
3. **development**: Local development machines

Each toggle can be independently enabled/disabled per environment.
