# OpenAPI Specs for ClimateConnect API

**Status**: DRAFT  
**Type**: Documentation / Feature  
**Date and time created**: 2026-01-14 14:50 UTC  
**Date Completed**: -  
**Related GitHub Issue**: [#1736 - OpenAPI specs for ClimateConnect API](https://github.com/climateconnect/climateconnect/issues/1736)

## Problem Statement

The ClimateConnect REST API currently lacks comprehensive documentation, making it difficult for developers to understand and use the API effectively, particularly when using tools like Postman or when integrating external services.

**Core Requirements (User/Stakeholder Stated):**
1. Provide OpenAPI specification (OpenAPI 3.0+) for the ClimateConnect REST API
2. Make the API schema discoverable and accessible to developers
3. Enable easier testing and integration with tools like Postman
4. Document existing endpoints, request/response formats, and authentication

**Context:**
- Climate Connect uses Django REST Framework (DRF) which has built-in support for schema generation
- The API has multiple apps: climateconnect_api, organization, chat_messages, hubs, ideas, climate_match, location
- Token-based authentication (Django REST Knox) is used
- This is a documentation/tooling improvement, not a behavioral change

### Non Functional Requirements

1. **Completeness**: Cover all major API endpoints across all apps
2. **Accuracy**: Schema should match actual API behavior
3. **Maintainability**: Schema should be automatically generated from code where possible
4. **Accessibility**: Schema should be available via URL endpoint and downloadable
5. **Standards Compliance**: Follow OpenAPI 3.0+ specification
6. **Developer Experience**: Include descriptions, examples, and authentication details

### AI Agent Insights and Additions

**Additional Technical Considerations:**
1. DRF's built-in schema generation (`drf-spectacular` or `drf-yasg`) can automate most of the work
2. Consider adding Swagger UI/ReDoc interface for interactive API exploration
3. May need custom schema generation for WebSocket endpoints (out of scope for OpenAPI, document separately)
4. Should include authentication flow documentation (token acquisition)
5. Consider versioning strategy for API schema
6. Add schema validation in CI/CD pipeline to ensure it stays up-to-date
7. Document rate limiting, pagination patterns, and error response formats

**Strategic Observations:**
- This will significantly improve developer onboarding and API adoption
- Can serve as foundation for automated API client generation
- Helps maintain API consistency and discover undocumented endpoints
- Valuable for external integrations and partner development

## System impact

**Actors involved**: 
- API Developer (maintaining the schema)
- External Developer (consuming the API)
- Platform Admin (understanding API capabilities)
- Integration Partners (building integrations)

**Actions to implement**:
- Developer → Access OpenAPI Schema → Via HTTP endpoint
- Developer → View Interactive API Docs → Via Swagger UI/ReDoc
- Developer → Download OpenAPI Spec → For Postman/tools
- Developer → Test API Endpoints → Via interactive docs
- CI/CD → Validate Schema → On code changes

**Flows affected**:
- Developer Onboarding Flow (new documentation resource)
- API Integration Flow (easier with specs)
- API Testing Flow (Postman/tools can import spec)

**Entity changes needed**: No
- No database changes required
- Purely additive documentation feature

**Flow changes needed**: No
- Existing API behavior remains unchanged
- New documentation access flow added

**Integration changes needed**: Minimal
- Add OpenAPI schema generation library
- Add URL endpoint for schema access
- Optional: Add Swagger UI/ReDoc views

**New specifications required**:
- Developer documentation on how to access and use the OpenAPI schema
- Schema maintenance guide for developers

## Software Architecture

### API

**New Endpoints:**
- `GET /api/schema/` - Returns OpenAPI JSON/YAML schema
- `GET /api/docs/` - Interactive Swagger UI (optional)
- `GET /api/redoc/` - Interactive ReDoc UI (optional)

**Implementation Approach:**
Use `drf-spectacular` (recommended) or `drf-yasg` for automatic schema generation:

**Key Configuration:**
```python
# settings.py
REST_FRAMEWORK = {
    ...
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'ClimateConnect API',
    'DESCRIPTION': 'API for Climate Connect platform - connecting climate activists and projects',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'AUTHENTICATION_CLASSES': ['knox.auth.TokenAuthentication'],
}
```

**No breaking changes - purely additive.**

### Backend

**Django Package Installation:**
- Install `drf-spectacular` via PDM
- Configure in Django settings
- Add URL routes for schema and documentation

**Customization Needed:**
- Add docstrings to ViewSets/APIViews for better descriptions
- Add `@extend_schema` decorators for complex endpoints
- Document authentication flow (token acquisition)
- Document pagination and filtering parameters

**Files to Modify:**
- `backend/pyproject.toml` - Add drf-spectacular dependency
- `backend/climateconnect_main/settings.py` - Add configuration
- `backend/climateconnect_main/urls.py` - Add schema endpoints
- Various ViewSets - Add docstrings and schema annotations (iterative improvement)

### Frontend

**No changes required** for this task.

Frontend developers will benefit from the API documentation but no code changes needed.

### Data

**No database changes required.**

This is a documentation/tooling feature only.

### Other

**Documentation:**
- Developer guide: "How to Access ClimateConnect API Documentation"
- Contributor guide: "How to Maintain API Schema Accuracy"
- Add API documentation link to main README

**Testing:**
- Verify schema generation works for all major endpoints
- Test Swagger UI/ReDoc interfaces
- Validate schema against OpenAPI 3.0 specification
- Test schema import into Postman

## Technical Solution Overview

### Implementation Steps

1. **Install drf-spectacular**
   ```bash
   cd backend
   pdm add drf-spectacular
   ```

2. **Configure Django Settings**
   - Add `drf_spectacular` to `INSTALLED_APPS`
   - Configure `REST_FRAMEWORK['DEFAULT_SCHEMA_CLASS']`
   - Add `SPECTACULAR_SETTINGS` configuration

3. **Add URL Routes**
   ```python
   # climateconnect_main/urls.py
   from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
   
   urlpatterns = [
       # ... existing patterns ...
       path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
       path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
       path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
   ]
   ```

4. **Enhance Endpoint Documentation** (iterative)
   - Add docstrings to ViewSets and APIViews
   - Use `@extend_schema` decorator for complex cases
   - Document request/response examples
   - Document authentication requirements

5. **Test and Validate**
   - Generate schema: visit `/api/schema/`
   - View interactive docs: visit `/api/docs/` or `/api/redoc/`
   - Download and import into Postman
   - Verify completeness across all apps

6. **Update Documentation**
   - Add API docs link to README
   - Create developer guide
   - Update contributor documentation

### Example Enhancement

```python
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import viewsets

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing climate action projects.
    
    Projects are the core entities representing climate initiatives,
    events, or ideas on the Climate Connect platform.
    """
    
    @extend_schema(
        summary="List all projects",
        description="Retrieve a paginated list of projects with optional filtering",
        parameters=[
            OpenApiParameter(name='hub', description='Filter by hub URL slug', type=str),
            OpenApiParameter(name='search', description='Search projects by name', type=str),
        ],
        responses={200: ProjectSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
```

## Definition of Done

**Success Criteria:**
- [ ] OpenAPI schema is generated and accessible at `/api/schema/`
- [ ] Interactive API documentation is available (Swagger UI or ReDoc)
- [ ] Schema covers all major endpoints across all Django apps
- [ ] Authentication is properly documented
- [ ] Schema validates against OpenAPI 3.0+ specification
- [ ] Schema can be imported into Postman successfully
- [ ] Developer documentation is updated with API docs access info
- [ ] No breaking changes to existing API behavior

**Testing:**
- [ ] Manual verification of schema completeness
- [ ] Test schema import in Postman
- [ ] Verify interactive docs work correctly
- [ ] Validate schema with OpenAPI validator tool

**Documentation:**
- [ ] README updated with API documentation link
- [ ] Developer guide created
- [ ] Contribution guide updated for schema maintenance

## Task Log

**2026-01-14 14:50 UTC** - Task created by Taskie based on GitHub issue #1736 created by @HaraldWalker

---

**Notes:**
- This is a documentation enhancement, not a behavioral change
- Implementation can be done incrementally (basic schema first, then enhanced with more details)
- Consider this as foundation for future API versioning and client generation

