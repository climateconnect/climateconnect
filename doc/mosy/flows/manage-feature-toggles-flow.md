# Manage Feature Toggles Flow

## Overview

This document describes the flow for managing feature toggles in the Climate Connect platform.

## Actors

- **Admin**: Manages feature toggles via Django Admin
- **Developer**: Implements code that respects feature toggles
- **System**: Reads toggle states to conditionally enable/disable functionality

## Flows

### 1. Creating a Feature Toggle

1. Admin navigates to Django Admin (`/admin/feature_toggles/featuretoggle/`)
2. Admin clicks "Add Feature Toggle"
3. Admin fills in:
   - **Name**: Unique identifier (e.g., `NEW_DASHBOARD`)
   - **Description**: What this feature controls
   - **Environment states**: Enable/disable for production, staging, development
4. Admin saves the toggle
5. System logs the creation event

### 2. Updating a Feature Toggle

1. Admin navigates to Django Admin
2. Admin selects an existing toggle
3. Admin modifies the desired fields
4. Admin saves the changes
5. System logs the modification (including what changed)

### 3. Deleting a Feature Toggle

1. Admin navigates to Django Admin
2. Admin selects one or more toggles
3. Admin chooses to delete
4. System logs the deletion
5. Toggle is removed

### 4. Using Feature Toggles in Code

#### Frontend (React/Next.js)

```typescript
// Check if feature is enabled
if (isFeatureEnabled('NEW_DASHBOARD')) {
  // Show new feature
}
```

#### Backend (Django)

```python
from feature_toggles.utility import is_feature_enabled

# Check if feature is enabled
if is_feature_enabled('NEW_DASHBOARD', 'production'):
    # Enable new feature
```

### 5. Fetching Toggles (Frontend)

The frontend fetches all toggles for the current environment:

```
GET /api/feature_toggles/?environment=production
```

Response:
```json
{
  "NEW_DASHBOARD": true,
  "BETA_FEATURE": false
}
```

## Environment Detection

The frontend detects the environment based on hostname:

- **Production**: `climateconnect.earth`, `www.climateconnect.earth`
- **Staging**: Hostnames containing `staging` or `slot2`
- **Development**: `localhost`, `127.0.0.1`

## Caching

- Feature toggles are cached for 5 minutes in Redis
- Cache is invalidated when toggles are modified via Admin
- API responses are cached at the CDN level for performance

## Best Practices

1. Use descriptive names (uppercase with underscores)
2. Add meaningful descriptions for each toggle
3. Default to disabled (`false`) for new features
4. Remove toggles after full rollout
5. Test with all environment states before production deployment
