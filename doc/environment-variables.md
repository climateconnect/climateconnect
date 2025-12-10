# Environment Variables Documentation

This document provides a comprehensive reference for all environment variables used in the Climate Connect platform, organized by frontend and backend.

## Table of Contents

1. [Backend Environment Variables](#backend-environment-variables)
   - [Core Django Settings](#core-django-settings)
   - [Database Configuration](#database-configuration)
   - [Redis & Celery](#redis--celery)
   - [Email & Mailjet](#email--mailjet)
   - [Azure Storage](#azure-storage)
   - [External Services](#external-services)
   - [Feature Flags](#feature-flags)
   - [Monitoring & Logging](#monitoring--logging)
2. [Frontend Environment Variables](#frontend-environment-variables)
   - [API Configuration](#api-configuration)
   - [Environment Settings](#environment-settings)
   - [Feature Configuration](#feature-configuration)
   - [External Integrations](#external-integrations)
3. [Environment Setup](#environment-setup)
4. [Environment Variable Checklist](#environment-variable-checklist)
5. [Troubleshooting](#troubleshooting)
6. [Additional Resources](#additional-resources)
7. [Version History](#version-history)

---

## Backend Environment Variables

Backend environment variables are stored in `.backend_env` file in the `backend/` directory.

### Core Django Settings

#### SECRET_KEY
- **Required**: ✅ Yes
- **Type**: String
- **Description**: Django secret key used for cryptographic signing (sessions, passwords, tokens)
- **Example**: `"XXX/YYY"`
- **Generation**: `openssl rand -base64 32`
- **Security**: Never commit to version control. Must be unique per environment.

#### DEBUG
- **Required**: ✅ Yes
- **Type**: Boolean (string)
- **Description**: Enables Django debug mode with detailed error pages
- **Values**: `"true"` | `"false"`
- **Default**: Should be `"false"`
- **Development**: `"true"`
- **Production**: `"false"` (CRITICAL: never enable in production)

#### ALLOWED_HOSTS
- **Required**: ✅ Yes
- **Type**: Comma-separated string
- **Description**: List of host/domain names that Django will serve
- **Example**: `"localhost,climateconnect.earth,api.climateconnect.earth"`
- **Development**: `"localhost"`
- **Production**: Include all production domains

#### ENVIRONMENT
- **Required**: ✅ Yes
- **Type**: String
- **Description**: Specifies the runtime environment
- **Values**: `"development"` | `"test"` | `"production"`
- **Usage**: Controls feature toggles, storage backend, and error reporting
- **Development**: `"development"`
- **Production**: `"production"`

#### FRONTEND_URL
- **Required**: ✅ Yes
- **Type**: String (URL)
- **Description**: Base URL of the frontend application for CORS and email links
- **Example**: `"http://localhost:3000"` (dev), `"https://climateconnect.earth"` (prod)
- **Usage**: Used in email templates, CORS settings, and redirects

#### MEDIA_ROOT
- **Required**: ✅ Yes
- **Type**: String (absolute path)
- **Description**: Absolute filesystem path to directory for user-uploaded files
- **Example**: `"/Users/CC/Development/climateconnect/backend/media/"`
- **Production**: Not used if Azure Blob Storage is configured
- **Permissions**: Directory must be writable by Django process

#### STATIC_ROOT
- **Required**: ⚠️ Conditional (production)
- **Type**: String (absolute path)
- **Description**: Absolute path to directory for collected static files
- **Example**: `"/Users/CC/Development/climateconnect/backend/media/static"`
- **Usage**: Target for `python manage.py collectstatic` command
- **Production**: Required when not using Azure Storage

#### AUTO_VERIFY
- **Required**: ❌ No
- **Type**: Boolean (string)
- **Description**: Automatically verify user emails without sending verification email
- **Values**: `"true"` | `"True"` | `"TRUE"` | any other value (false)
- **Default**: `False`
- **Development**: `"true"` (skip email verification)
- **Production**: `False` (require email verification)

---

### Database Configuration

#### DATABASE_NAME
- **Required**: ✅ Yes
- **Type**: String
- **Description**: PostgreSQL database name
- **Example**: `"climateconnect-dev"` (dev), `"climateconnect-prod"` (prod)

#### DATABASE_USER
- **Required**: ✅ Yes
- **Type**: String
- **Description**: PostgreSQL username
- **Example**: `"postgres"`, `"climateconnect_user"`

#### DATABASE_PASSWORD
- **Required**: ✅ Yes
- **Type**: String
- **Description**: PostgreSQL user password
- **Example**: `"secure_password_here"`
- **Security**: Use strong passwords in production. Store securely.

#### DATABASE_HOST
- **Required**: ✅ Yes
- **Type**: String (hostname or IP)
- **Description**: PostgreSQL server hostname or IP address
- **Development**: `"localhost"` or `"127.0.0.1"`
- **Production**: Database server hostname or IP
- **Docker**: Service name from docker-compose (e.g., `"db"`)

#### DATABASE_PORT
- **Required**: ❌ No
- **Type**: String (port number)
- **Description**: PostgreSQL server port
- **Default**: `"5432"`
- **Example**: `"5432"`, `"5499"` (custom)

---

### Redis & Celery

#### REDIS_HOST
- **Required**: ⚠️ Conditional (if using separate config)
- **Type**: String (hostname or IP)
- **Description**: Redis server hostname
- **Example**: `"localhost"`, `"redis"`
- **Usage**: Used to construct channel layer config

#### REDIS_PORT
- **Required**: ⚠️ Conditional (if using separate config)
- **Type**: String (port number)
- **Description**: Redis server port
- **Default**: `"6379"`
- **Example**: `"6379"`

#### REDIS_PASSWORD
- **Required**: ❌ No
- **Type**: String
- **Description**: Redis authentication password
- **Default**: `""` (no password)
- **Production**: Should be set for security

#### REDIS_URL
- **Required**: ✅ Yes (if not using separate REDIS_HOST/PORT)
- **Type**: String (URL)
- **Description**: Complete Redis connection URL
- **Format**: `"redis://[password@]hostname[:port][/db]"`
- **Example**: `"redis://localhost"`, `"redis://localhost:6379/0"`
- **Usage**: Used for caching and channel layers

#### CELERY_BROKER_URL
- **Required**: ✅ Yes
- **Type**: String (URL)
- **Description**: Celery message broker URL (typically Redis)
- **Format**: `"redis://[password@]hostname[:port][/db]"`
- **Example**: `"redis://127.0.0.1"`, `"redis://localhost:6379/0"`
- **Usage**: Queue for background tasks

#### CACHE_BACHED_RANK_REQUEST
- **Required**: ❌ No
- **Type**: Boolean (string)
- **Description**: Enable caching for project ranking calculations
- **Values**: `"true"` | any other value (false)
- **Default**: `"false"`
- **Performance**: Set to `"true"` to cache expensive ranking queries

---

### Email & Mailjet

#### EMAIL_HOST
- **Required**: ⚠️ Conditional (if sending emails)
- **Type**: String (hostname)
- **Description**: SMTP server hostname
- **Example**: `"smtp.mailjet.com"`

#### EMAIL_HOST_USER
- **Required**: ⚠️ Conditional (if sending emails)
- **Type**: String
- **Description**: SMTP authentication username
- **Example**: `"your-mailjet-api-key"`

#### EMAIL_HOST_PASSWORD
- **Required**: ⚠️ Conditional (if sending emails)
- **Type**: String
- **Description**: SMTP authentication password
- **Example**: `"your-mailjet-secret"`

#### EMAIL_PORT
- **Required**: ⚠️ Conditional (if sending emails)
- **Type**: String (port number)
- **Description**: SMTP server port
- **Common**: `"25"` (plain), `"587"` (TLS), `"465"` (SSL)

#### MJ_APIKEY_PUBLIC
- **Required**: ⚠️ Conditional (if using Mailjet)
- **Type**: String
- **Description**: Mailjet public API key
- **Usage**: Mailjet service authentication

#### MJ_APIKEY_PRIVATE
- **Required**: ⚠️ Conditional (if using Mailjet)
- **Type**: String
- **Description**: Mailjet private API key (secret)
- **Usage**: Mailjet service authentication
- **Security**: Never expose publicly

#### CLIMATE_CONNECT_SUPPORT_EMAIL
- **Required**: ❌ No
- **Type**: String (email)
- **Description**: Support email address for user communications
- **Example**: `"support@climateconnect.earth"`
- **Usage**: "Reply-to" address in automated emails

#### CLIMATE_CONNECT_CONTACT_EMAIL
- **Required**: ❌ No
- **Type**: String (email)
- **Description**: General contact email address
- **Example**: `"contact@climateconnect.earth"`

#### MAILJET_NEWSLETTER_LIST_ID
- **Required**: ⚠️ Conditional (if using newsletter)
- **Type**: String
- **Description**: Mailjet list ID for newsletter subscribers
- **Usage**: Adding users to newsletter mailing list

#### Email Template IDs

All email template variables follow the pattern: `{TEMPLATE_NAME}_TEMPLATE_ID[_DE]`

**English Templates**:
- `EMAIL_VERIFICATION_TEMPLATE_ID` - Email verification on signup
- `NEW_EMAIL_VERIFICATION_TEMPLATE_ID` - Email change verification
- `RESET_PASSWORD_TEMPLATE_ID` - Password reset
- `FEEDBACK_TEMPLATE_ID` - User feedback submission
- `PRIVATE_MESSAGE_TEMPLATE_ID` - Private chat message notification
- `GROUP_MESSAGE_TEMPLATE_ID` - Group chat message notification
- `PROJECT_COMMENT_TEMPLATE_ID` - Comment on project
- `PROJECT_MENTION_TEMPLATE_ID` - Mention in project
- `PROJECT_COMMENT_REPLY_TEMPLATE_ID` - Reply to project comment
- `PROJECT_FOLLOWER_TEMPLATE_ID` - New project follower
- `PROJECT_LIKE_TEMPLATE_ID` - Project liked
- `PROJECT_JOIN_REQUEST_TEMPLATE_ID` - Project join request
- `ORGANIZATION_FOLLOWER_TEMPLATE_ID` - New organization follower
- `ORG_PUBLISHED_NEW_PROJECT_TEMPLATE_ID` - Organization published project
- `IDEA_COMMENT_TEMPLATE_ID` - Comment on idea
- `IDEA_COMMENT_REPLY_TEMPLATE_ID` - Reply to idea comment
- `IDEA_MENTION_TEMPLATE_ID` - Mention in idea
- `JOINED_IDEA_TEMPLATE` - User joined idea discussion

**German Templates** (append `_DE` to template name):
- All above templates have German variants with `_DE` suffix
- Example: `PROJECT_COMMENT_TEMPLATE_ID_DE`

**Template Configuration**:
- **Required**: ⚠️ Conditional (per template type used)
- **Type**: String (Mailjet template ID)
- **Example**: `"1234567"`
- **Usage**: Specify which Mailjet template to use for each notification type

---

### Azure Storage

Azure Blob Storage is used in production for media file storage.

#### AZURE_ACCOUNT_NAME
- **Required**: ⚠️ Conditional (if ENVIRONMENT is not "development" or "test")
- **Type**: String
- **Description**: Azure Storage account name
- **Example**: `"climateconnectstorage"`

#### AZURE_ACCOUNT_KEY
- **Required**: ⚠️ Conditional (if using Azure Storage)
- **Type**: String
- **Description**: Azure Storage account access key
- **Security**: Highly sensitive credential. Never commit to version control.

#### AZURE_CONTAINER
- **Required**: ⚠️ Conditional (if using Azure Storage)
- **Type**: String
- **Description**: Azure Blob Storage container name
- **Example**: `"media"`, `"climateconnect-media"`

#### AZURE_HOST
- **Required**: ⚠️ Conditional (if using Azure Storage)
- **Type**: String
- **Description**: Azure Storage host domain
- **Default**: `"blob.core.windows.net"`
- **Example**: `"blob.core.windows.net"`

---

### External Services

#### LOCATION_SERVICE_BASE_URL
- **Required**: ✅ Yes
- **Type**: String (URL)
- **Description**: Base URL for geocoding API (OpenStreetMap Nominatim)
- **Example**: `"https://..."`
- **Usage**: Geocoding addresses to coordinates, location search

#### ENABLE_LEGACY_LOCATION_FORMAT
- **Required**: ❌ No
- **Type**: Boolean (string)
- **Description**: Disable geocoding API and use legacy location format
- **Values**: `"True"` (disable API) | `"False"` (use API)
- **Default**: `"False"`
- **Usage**: Set to `"True"` to bypass external geocoding service

#### DEEPL_API_KEY
- **Required**: ⚠️ Conditional (if using translation features)
- **Type**: String
- **Description**: DeepL API key for automated translations
- **Example**: `"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"`
- **Usage**: Machine translation of user content

---

### Feature Flags

#### USER_CHUNK_SIZE
- **Required**: ❌ No
- **Type**: Integer (string)
- **Description**: Chunk size for batch user operations
- **Default**: `100`
- **Example**: `"100"`, `"500"`
- **Usage**: Processing users in batches for performance

---

### Monitoring & Logging

#### SENTRY_DSN
- **Required**: ❌ No
- **Type**: String (DSN URL)
- **Description**: Sentry Data Source Name for error tracking
- **Format**: `"https://<key>@<organization>.ingest.sentry.io/<project>"`
- **Usage**: Send exceptions and errors to Sentry
- **Production**: Highly recommended for error monitoring

#### SENTRY_ENVIRONMENT
- **Required**: ⚠️ Conditional (if using Sentry)
- **Type**: String
- **Description**: Environment name for Sentry error grouping
- **Example**: `"development"`, `"staging"`, `"production"`
- **Usage**: Filter errors by environment in Sentry dashboard

---

## Frontend Environment Variables

Frontend environment variables are stored in `.env` file in the `frontend/` directory.

### API Configuration

#### API_HOST
- **Required**: ✅ Yes
- **Type**: String (hostname)
- **Description**: Backend API hostname (without protocol or path)
- **Development**: `"localhost"`
- **Production**: `"api.climateconnect.earth"` or similar
- **Usage**: Constructing API URLs

#### API_URL
- **Required**: ✅ Yes
- **Type**: String (URL)
- **Description**: Complete backend API base URL
- **Format**: `"http://hostname:port"` or `"https://hostname"`
- **Development**: `"http://127.0.0.1:8000"`
- **Production**: `"https://api.climateconnect.earth"`
- **Usage**: All API requests are prefixed with this URL

#### BASE_URL_HOST
- **Required**: ✅ Yes
- **Type**: String (hostname)
- **Description**: Frontend application hostname (without protocol)
- **Development**: `"localhost"`
- **Production**: `"climateconnect.earth"` or similar
- **Usage**: Constructing absolute URLs for sharing, canonical links

#### BASE_URL
- **Required**: ❌ No
- **Type**: String (URL)
- **Description**: Complete frontend base URL (alternative to BASE_URL_HOST)
- **Example**: `"https://climateconnect.earth"`

#### SOCKET_URL
- **Required**: ✅ Yes
- **Type**: String (WebSocket URL)
- **Description**: WebSocket server URL for real-time chat
- **Format**: `"ws://hostname"` or `"wss://hostname"`
- **Development**: `"ws://localhost"`
- **Production**: `"wss://climateconnect.earth"` or `"wss://api.climateconnect.earth"`
- **Protocol**: Use `ws://` for HTTP, `wss://` for HTTPS

---

### Environment Settings

#### ENVIRONMENT
- **Required**: ✅ Yes
- **Type**: String
- **Description**: Specifies the runtime environment
- **Values**: `"development"` | `"staging"` | `"production"`
- **Development**: `"development"`
- **Production**: `"production"`
- **Usage**: Feature toggles, analytics, error reporting

#### PORT
- **Required**: ❌ No
- **Type**: Integer (string)
- **Description**: Port for Next.js development server
- **Default**: `3000`
- **Example**: `"3000"`, `"3001"`
- **Usage**: `yarn dev` will use this port if specified

---

### Feature Configuration

#### ENABLE_LEGACY_LOCATION_FORMAT
- **Required**: ❌ No
- **Type**: Boolean (string)
- **Description**: Use legacy location format instead of geocoding API
- **Values**: `"True"` | `"False"`
- **Default**: `"False"`
- **Usage**: Must match backend setting for consistency

#### ENABLE_DEVLINK
- **Required**: ❌ No
- **Type**: Boolean (string)
- **Description**: Enable Webflow Devlink components
- **Values**: `"true"` | `"false"`
- **Default**: `"false"`
- **Development**: Can be `"true"` if using Webflow
- **Production**: Should match design system setup

#### CUSTOM_HUB_URLS
- **Required**: ❌ No
- **Type**: Comma-separated string
- **Description**: List of custom hub URL slugs
- **Format**: `"hub1,hub2,hub3"` (no spaces)
- **Example**: `"prio1,perth"`
- **Usage**: Identify hubs with special routing or behavior

#### LOCATION_HUBS
- **Required**: ❌ No
- **Type**: Comma-separated string
- **Description**: List of location-based hub slugs
- **Format**: `"location1,location2,location3"` (no spaces)
- **Example**: `"erlangen,wuerzburg,marburg"`
- **Usage**: Enable location-specific features for these hubs

#### DONATION_CAMPAIGN_RUNNING
- **Required**: ❌ No
- **Type**: Boolean (string)
- **Description**: Show donation campaign banner/features
- **Values**: `"true"` | `"false"`
- **Default**: `"false"`
- **Usage**: Toggle visibility of donation CTAs

---

### External Integrations

#### WEBFLOW_API_TOKEN
- **Required**: ⚠️ Conditional (if using Webflow integration)
- **Type**: String
- **Description**: Webflow API authentication token
- **Usage**: Fetch content from Webflow CMS
- **Security**: Keep secure, rate limits apply

#### WEBFLOW_SITE_ID
- **Required**: ⚠️ Conditional (if using Webflow integration)
- **Type**: String
- **Description**: Webflow site identifier
- **Example**: `"12345678"`
- **Usage**: Identify which Webflow site to fetch content from

#### GOOGLE_ANALYTICS_CODE
- **Required**: ❌ No
- **Type**: String
- **Description**: Google Analytics tracking ID
- **Format**: `"UA-XXXXXXXXX-X"` or `"G-XXXXXXXXXX"`
- **Example**: `"G-ABCD123456"`
- **Production**: Enable for analytics tracking
- **Development**: Leave unset to avoid polluting analytics

#### FRONTEND_SENTRY_DSN
- **Required**: ❌ No
- **Type**: String (DSN URL)
- **Description**: Sentry Data Source Name for frontend error tracking
- **Format**: `"https://<key>@<organization>.ingest.sentry.io/<project>"`
- **Usage**: Send frontend errors and exceptions to Sentry
- **Production**: Highly recommended

#### LATEST_NEWSLETTER_LINK
- **Required**: ❌ No
- **Type**: String (URL)
- **Description**: URL to latest newsletter issue
- **Example**: `"https://newsletter.climateconnect.earth/latest"`
- **Usage**: Display link to current newsletter

#### LETS_ENCRYPT_FILE_CONTENT
- **Required**: ❌ No
- **Type**: String
- **Description**: Content for Let's Encrypt verification file
- **Usage**: SSL certificate validation (deployment-specific)

---

## Environment Setup

### Backend Setup

1. **Create environment file**:
   ```bash
   cd backend
   cp .backend_env.example .backend_env
   ```

2. **Edit `.backend_env`**:
   - Set `SECRET_KEY` (generate with `openssl rand -base64 32`)
   - Configure database credentials
   - Set `DEBUG=true` for development
   - Set `AUTO_VERIFY=true` to skip email verification
   - Configure Redis URL

3. **Minimal development configuration**:
   ```bash
   FRONTEND_URL="http://localhost:3000"
   SECRET_KEY="<generated-secret-key>"
   ALLOWED_HOSTS="localhost"
   ENVIRONMENT="development"
   MEDIA_ROOT="/absolute/path/to/backend/media"
   DEBUG="true"
   AUTO_VERIFY="true"

   DATABASE_NAME="climateconnect-dev"
   DATABASE_USER="postgres"
   DATABASE_PASSWORD="your_password"
   DATABASE_HOST="localhost"
   DATABASE_PORT="5432"

   REDIS_URL="redis://localhost"
   CELERY_BROKER_URL="redis://localhost"

   LOCATION_SERVICE_BASE_URL="https://..."
   ENABLE_LEGACY_LOCATION_FORMAT="False"

   CACHE_BACHED_RANK_REQUEST="true"
   ```

### Frontend Setup

1. **Create environment file**:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Edit `.env`**:
   ```bash
   API_HOST="localhost"
   API_URL="http://127.0.0.1:8000"
   BASE_URL_HOST="localhost"
   SOCKET_URL="ws://localhost"
   ENVIRONMENT="development"
   ```

3. **Optional settings**:
   - Add `CUSTOM_HUB_URLS` if testing custom hubs
   - Add `LOCATION_HUBS` if testing location-based features
   - Add `ENABLE_DEVLINK="true"` if using Webflow components

---

## Environment Variable Checklist

### Backend - Required for Development
- [ ] `SECRET_KEY`
- [ ] `DEBUG`
- [ ] `ALLOWED_HOSTS`
- [ ] `ENVIRONMENT`
- [ ] `FRONTEND_URL`
- [ ] `MEDIA_ROOT`
- [ ] `DATABASE_NAME`
- [ ] `DATABASE_USER`
- [ ] `DATABASE_PASSWORD`
- [ ] `DATABASE_HOST`
- [ ] `REDIS_URL`
- [ ] `CELERY_BROKER_URL`
- [ ] `LOCATION_SERVICE_BASE_URL`

### Backend - Required for Production
- [ ] All development requirements
- [ ] `AUTO_VERIFY` (set to false)
- [ ] `AZURE_ACCOUNT_NAME`
- [ ] `AZURE_ACCOUNT_KEY`
- [ ] `AZURE_CONTAINER`
- [ ] `STATIC_ROOT`
- [ ] Email configuration (Mailjet keys + template IDs)
- [ ] `CLIMATE_CONNECT_SUPPORT_EMAIL`
- [ ] `REDIS_PASSWORD`
- [ ] `SENTRY_DSN`
- [ ] `SENTRY_ENVIRONMENT`

### Frontend - Required for Development
- [ ] `API_HOST`
- [ ] `API_URL`
- [ ] `BASE_URL_HOST`
- [ ] `SOCKET_URL`
- [ ] `ENVIRONMENT`

### Frontend - Required for Production
- [ ] All development requirements
- [ ] `GOOGLE_ANALYTICS_CODE` (recommended)
- [ ] `FRONTEND_SENTRY_DSN` (recommended)

---

## Troubleshooting

### Backend

**Database connection errors**:
- Verify PostgreSQL is running
- Check `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`
- Verify user credentials
- Ensure PostGIS extension is installed

**Redis connection errors**:
- Verify Redis is running
- Check `REDIS_URL` format
- Verify `REDIS_PASSWORD` if set
- Test connection: `redis-cli ping`

**Email not sending**:
- Check Mailjet credentials (`MJ_APIKEY_PUBLIC`, `MJ_APIKEY_PRIVATE`)
- Verify template IDs exist in Mailjet dashboard
- Check Celery worker is running
- Review Celery logs for task failures

**Media uploads failing**:
- In development: Verify `MEDIA_ROOT` directory exists and is writable
- In production: Verify Azure credentials and container name
- Check `ENVIRONMENT` setting matches configuration

### Frontend

**API requests failing**:
- Verify backend is running
- Check `API_URL` matches backend URL
- Verify CORS settings in backend
- Check auth token in cookies

**WebSocket connection failing**:
- Verify `SOCKET_URL` protocol (`ws://` or `wss://`)
- Check backend WebSocket routing
- Verify token is being sent in connection params
- Review browser console for errors

**Environment variables not loading**:
- Verify `.env` file exists in `frontend/` directory
- Check `next.config.js` includes variable in `env` array
- Restart Next.js dev server after changing `.env`
- Use `process.env.VARIABLE_NAME` in code

---

## Additional Resources

- **Backend setup**:[ `/backend/local-env-setup.md`](../backend/local-env-setup.md)
- **Architecture**: [`/doc/architecture.md`](architecture.md)
- **Domain entities**: [`/doc/domain-entities.md`](domain-entities.md)
- **Django settings**: [`/backend/climateconnect_main/settings.py`](../backend/climateconnect_main/settings.py)
- **Next.js config**: [`/frontend/next.config.js`](../frontend/next.config.js)

---

## Version History

- **2025-11-27**: Initial documentation
