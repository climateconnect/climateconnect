# Backend AI Agent Instructions for Climate Connect

> **Mission**: Build robust Django APIs and services that power the climate action platform.

## Backend Tech Stack
- **Framework**: Django 3.2 + Django REST Framework
- **Language**: Python 3.11
- **Database**: PostgreSQL with PostGIS extension (geospatial data)
- **Caching/Message Broker**: Redis
- **Real-time**: Django Channels (WebSocket support via ASGI)
- **Background Tasks**: Celery + Celery Beat (scheduled tasks)
- **Authentication**: Django REST Knox (token-based)
- **Package Manager**: PDM (pyproject.toml)
- **Storage**: Azure Blob Storage (media files)
- **Testing**: Django test framework + Factory Boy + Faker

## Architecture Patterns

### Django App Structure
Each domain has its own app (climateconnect_api, organization, chat_messages, hubs, ideas, climate_match, location, translations):

```
app_name/
  ├── models/          # Database models (can be split into multiple files)
  ├── serializers/     # DRF serializers for API responses
  ├── views/           # API views/viewsets
  ├── permissions.py   # Custom DRF permissions
  ├── urls.py          # URL routing
  ├── admin.py         # Django admin customization
  ├── utility/         # Helper functions
  ├── migrations/      # Database migrations
  ├── locale/          # Translation files (i18n)
  └── tests/           # Test files
```

### API Design
- **RESTful API**: Standard REST endpoints with DRF ViewSets and APIViews
- **WebSocket**: Real-time chat via Django Channels consumers
- **Background Processing**: Celery tasks for async operations (email, notifications, etc.)

## Code Style & Best Practices

### Formatting & Linting
- **Formatting**: Use `black` for code formatting (configured in pyproject.toml)
- **Linting**: Follow PEP 8
- **Commands**: 
  - Run `make format` before committing
  - Use `make start` to start the development server
  - Use `python manage.py <command>` for Django management commands

### Models
- Use explicit `related_name` for relationships
- Add helpful `__str__` methods
- Use `choices` for enum-like fields
- Include docstrings for complex models
- Add appropriate indexes for frequently queried fields
- Use `select_related`/`prefetch_related` for query optimization

### Serializers
- Keep serializers focused and single-purpose
- Use nested serializers for related data
- Implement `create()` and `update()` for complex operations
- Validate input data properly

### Views/ViewSets
- Use ViewSets for standard CRUD operations
- Use APIView for custom endpoints
- Apply appropriate permission classes
- Return proper HTTP status codes (200, 201, 400, 404, etc.)
- Implement proper pagination for list endpoints

### Permissions
- Create custom permission classes in `permissions.py`
- Follow least privilege principle
- Implement proper authentication checks

### Async Support
- Use async views/consumers for real-time features (Django Channels)
- Handle WebSocket connections with token authentication

## Common Commands

### Development
- `make start` - Start Django development server
- `make format` - Format code with black
- `python manage.py makemigrations` - Create migrations
- `python manage.py migrate` - Apply migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py test` - Run tests

### Background Tasks
- `celery -A climateconnect_main worker -l info` - Start Celery worker
- `celery -A climateconnect_main beat -l info` - Start Celery beat (scheduler)

### Database
- `psql` - PostgreSQL REPL (in dev container or `psql -h localhost -U <user> <db>`)
- `redis-cli -h redis` - Redis REPL (in dev container) or `redis-cli`

## Important Considerations

### Performance
- Always consider database performance (use `select_related`/`prefetch_related` for relations)
- Implement proper pagination for list endpoints
- Add appropriate indexes in models for frequently queried fields
- Use transactions for multi-model operations
- Cache expensive queries with Redis
- Handle timezone-aware datetimes (use Django's timezone utils)

### Security
- Validate all user input
- Use Django's built-in CSRF protection
- Implement proper authentication checks
- Follow least privilege for permissions
- Sanitize user-generated content (XSS prevention)
- Log errors appropriately

### Testing
- Write tests for new features using Django test framework + Factory Boy
- Test error cases and edge conditions
- Clean up test data with `setUp()` and `tearDown()`
- Use `self.client` for API endpoint testing

### Documentation Maintenance
- Update `doc/domain-entities.md` when modifying models or relationships
- Update `doc/api-documentation.md` when changing endpoints or adding new ones
- Add new backend specifications to `doc/spec/` for major features (optional)
- Update `doc/architecture.md` for significant backend architecture changes
- Update `doc/environment-variables.md` when adding new environment variables
- Review and update this backend agent.md file as the backend evolves
- **Note**: `/doc/spec/` contains optional specifications for reference - use as helpful context but not required. **Workflow**: GitHub Issues lead the work, specs provide fine-grained details when available.

## Common Code Patterns

### Model Example
```python
from django.db import models

class Example(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    user = models.ForeignKey(User, related_name="examples", on_delete=models.CASCADE)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["name", "created_at"])]
    
    def __str__(self):
        return self.name
```

### Serializer Example
```python
from rest_framework import serializers

class ExampleSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = Example
        fields = ["id", "name", "created_at", "user", "user_name"]
        read_only_fields = ["id", "created_at"]
```

### ViewSet Example
```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class ExampleViewSet(viewsets.ModelViewSet):
    serializer_class = ExampleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Example.objects.select_related("user").filter(user=self.request.user)
```

### Celery Task Example
```python
from climateconnect_main.celery import app

@app.task
def send_notification_email(user_id, message):
    # Task implementation
    pass
```

## Quick Reference for Common Tasks

### Adding a New Model
1. Create model in `app/models/`
2. Add to `app/models/__init__.py`
3. Create serializer in `app/serializers/`
4. Run `python manage.py makemigrations`
5. Run `python manage.py migrate`
6. Register in `app/admin.py` (optional)
7. Add tests in `app/tests/`

### Adding a New API Endpoint
1. Create view in `app/views/`
2. Add URL pattern in `app/urls.py`
3. Implement permissions in view or `app/permissions.py`
4. Create/update serializer
5. Test endpoint
6. Document in code comments

### Adding a Background Task
1. Create task in `app/tasks.py` with `@app.task` decorator (using Celery app)
2. Import and call with `.apply_async()` or `.delay()`
3. Ensure Celery worker is running
4. Test task execution
5. Add periodic task in Celery Beat configuration if scheduled

## Environment Variables (.backend_env)
- `SECRET_KEY` - Django secret key
- `DEBUG` - Set to "true" for development
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `AZURE_STORAGE_ACCOUNT_NAME` - Azure blob storage account
- `AZURE_STORAGE_ACCOUNT_KEY` - Azure blob storage key
- `SENTRY_DSN` - Sentry error tracking DSN

## Key Dependencies to Remember
- Django 3.2, DRF, Channels, Celery, Knox, PostGIS, Redis, Azure Storage

## Resources
- **Main Site**: https://climateconnect.earth
- **Repo**: https://github.com/climateconnect/climateconnect
- **Issue Tracker**: Use GitHub Issues
- **Detailed Documentation**: See `/doc/` folder for comprehensive architecture, domain entities, and API documentation
  - `doc/architecture.md` - Complete system and backend architecture
  - `doc/domain-entities.md` - Detailed entity relationships and model documentation
  - `doc/api-documentation.md` - API reference and endpoint documentation
  - `doc/spec/` - Backend feature specifications
  - `doc/environment-variables.md` - Complete environment variable reference

**Remember**: This backend powers a climate action platform serving real users working on climate solutions. Write clean, maintainable, and performant code that helps the mission of connecting people to solve the climate crisis.
