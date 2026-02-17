# AI Agent Instructions for Climate Connect

> **Mission**: Climate Connect helps people solve the climate crisis by connecting activists, organizations, and projects for effective climate action.

## Project Overview

Climate Connect (climateconnect.earth) is a full-stack climate action platform connecting activists, organizations, and projects to facilitate collaboration on climate solutions. The platform enables users to discover projects, join organizations, share ideas, communicate in real-time, and participate in geography/sector-based communities.

**Repository Structure**: Monorepo with `/backend` (Django) and `/frontend` (Next.js) directories.

## Tech Stack

### Backend
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

### Frontend
- **Framework**: Next.js 12 (React 17)
- **Language**: JavaScript (partial TypeScript migration in progress)
- **UI Library**: Material-UI v5 (@mui/material)
- **Styling**: Emotion (@emotion/react, @emotion/styled)
- **State**: React hooks (no Redux/global state library)
- **HTTP Client**: Axios
- **Date Handling**: date-fns, dayjs
- **Package Manager**: Yarn (also supports Bun - bun.lock present)
- **Testing**: Jest
- **Rendering**: SSR (Server-Side Rendering)

### Infrastructure
- **Containers**: Docker (docker-compose for dev/prod)
- **Dev Environment**: VS Code Dev Containers supported
- **Deployment**: Azure App Service
- **Monitoring**: Sentry (error tracking)

## Key Domain Entities
- **UserProfile**: Extended user profiles with skills, availability, location
- **Organization**: Climate organizations with membership management
- **Project**: Climate action projects with status tracking, members, skills. A project can also be an event or an idea.
- **Hub**: Geographic/sector-based communities with custom branding
- **Chat**: Real-time messaging (user-to-user and group)
- **Notification**: Multi-channel notification system (in-app + email)
- **Badge**: Gamification system for achievements
- **Donation**: Fundraising campaigns and contribution tracking

## Development Workflow

### Local Setup
1. **Recommended**: Use VS Code Dev Containers for one-click setup
2. **Manual**: Follow README for PostgreSQL, Redis, Python venv, and Node.js setup
3. Start services:
   - Backend: `cd backend && make start` (port 8000)
   - Frontend: `cd frontend && yarn dev` (port 3000)
   - Redis: Available in dev container or local install
   - PostgreSQL: Available in dev container or local install

### Common Commands
**Backend**:
- `make start` - Start Django development server
- `make format` - Format code with black
- `python manage.py makemigrations` - Create migrations
- `python manage.py migrate` - Apply migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py test` - Run tests
- `celery -A climateconnect_main worker -l info` - Start Celery worker
- `celery -A climateconnect_main beat -l info` - Start Celery beat (scheduler)

**Frontend**:
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn format` - Run Prettier
- `yarn test` - Run Jest tests

### General Guidelines
- **Branch Strategy**: Create feature branches from `master` (single branching model)
- **Commits**: Write clear, concise commit messages
- **PRs**: 
  - Add meaningful title and description
  - Include detailed testing steps
  - Squash merge when approved
  - Ensure linting passes before PR
- **Testing**: 
  - Write tests for new features
  - Backend: Use Django test framework + Factory Boy
  - Frontend: Use Jest
- **Translations**: 
  - Support English and German
  - Use Django i18n for backend (`gettext`)
  - Add translation keys for user-facing strings
- **Documentation Maintenance**: 
  - Keep `/doc/` files updated when making architectural changes
  - Update entity documentation when modifying models or relationships
  - Add new user flows to `doc/mosy/flows/` when implementing features
  - Update API documentation when changing endpoints
  - Review and update architecture docs for major changes
  - Keep agent.md files in sync with project evolution
  - **Note**: `/doc/spec/` contains optional specifications for reference - use as helpful context but not required. **Workflow**: GitHub Issues lead the work, specs provide fine-grained details when available.

## File Naming Conventions
- **Backend**: `snake_case.py`
- **Frontend**: 
  - Components: `PascalCase.js` or `PascalCase.tsx`
  - Utils: `camelCase.js`
  - Pages: Next.js convention (lowercase with hyphens or dynamic `[param].js`)

## Important Considerations

### Security Considerations
- Never commit secrets (use .env files)
- Validate all user input
- Use Django's built-in CSRF protection
- Implement proper authentication checks
- Follow least privilege for permissions
- Sanitize user-generated content (XSS prevention)
- Use HTTPS in production

### When Working with Location Data
- Use PostGIS for geospatial queries
- Location model includes city, country, coordinates
- OpenStreetMap and Nominatim API for geocoding and map display
- Consider privacy when handling user locations

### When Working with Real-time Features
- WebSocket connections use token authentication
- Messages are sent/received through Django Channels
- Redis is the channel layer backend
- Handle connection drops and reconnection logic
- Test with multiple concurrent users

## Resources
- **Main Site**: https://climateconnect.earth
- **Repo**: https://github.com/climateconnect/climateconnect
- **Issue Tracker**: Use GitHub Issues
- **Detailed Documentation**: See `/doc/` folder for comprehensive architecture, domain entities, user flows, and API documentation
  - `doc/architecture.md` - Complete system architecture
  - `doc/domain-entities.md` - Detailed entity relationships
  - `doc/mosy/flows/` - User flow documentation
  - `doc/spec/` - Feature specifications
  - `doc/api-documentation.md` - API reference

**Remember**: This is a climate action platform serving real users working on climate solutions. Write clean, maintainable code that helps the mission of connecting people to solve the climate crisis.
