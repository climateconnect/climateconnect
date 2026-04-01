# ClimateConnect API Documentation

This guide explains how to access and use the ClimateConnect REST API for local development and integration purposes.

## Table of Contents
- [API Overview](#api-overview)
- [Getting an Authentication Token](#getting-an-authentication-token)
- [Using the API with Swagger UI](#using-the-api-with-swagger-ui)
- [Using the API with Postman](#using-the-api-with-postman)
- [Using the API with curl](#using-the-api-with-curl)
- [API Authentication](#api-authentication)
- [Common Endpoints](#common-endpoints)
- [Troubleshooting](#troubleshooting)

---

## API Overview

The ClimateConnect API is built with Django REST Framework and provides endpoints for:
- **Projects**: Browse, create, and manage climate action projects
- **Organizations**: Discover and manage climate organizations
- **Members**: Find climate activists and collaborators
- **Hubs**: Access location-based and sector-based climate hubs
- **Ideas**: Share and discover climate action ideas
- **Messaging**: Private and group chat functionality

**Base URLs:**
- **Local Development**: `http://localhost:8000`
- **Production**: `https://api.climateconnect.earth`

**API Documentation:**
- **Local Swagger UI**: http://localhost:8000/api/docs/
- **Local OpenAPI Schema**: http://localhost:8000/api/schema/

---

## Getting an Authentication Token

Many API endpoints require authentication using a Knox token. Here's how to obtain one:

### Option 1: Using Django Shell (Recommended for Development)

1. **Start the Django shell:**
   ```bash
   cd backend
   python manage.py shell
   ```

2. **Create a token for your user:**
   ```python
   from django.contrib.auth.models import User
   from knox.models import AuthToken

   # Get your user (replace 'your_username' with your actual username)
   user = User.objects.get(username='your_username')

   # Create a token
   instance, token = AuthToken.objects.create(user)

   # Print the token
   print(f"\nYour API Token: {token}\n")
   print("Save this token - you won't be able to see it again!")
   ```

3. **Copy and save the token** that is displayed. You'll need it for API requests.

### Option 2: Using the Login API Endpoint

1. **Send a POST request to the login endpoint:**
   ```bash
   curl -X POST http://localhost:8000/login/ \
     -H "Content-Type: application/json" \
     -d '{"email": "your@email.com", "password": "your_password"}'
   ```

2. **Extract the token from the response:**
   ```json
   {
     "token": "your_authentication_token_here",
     "user": { ... }
   }
   ```

### Token Properties

- **Format**: Knox tokens are long alphanumeric strings (e.g., `9f0ae9d697dd662288d5b018fb8a9c629a4868b07e3efbc91d179da0e2a8494c`)
- **Validity**: Tokens are valid for 120 days by default
- **Security**: Never commit tokens to version control or share them publicly

---

## Using the API with Swagger UI

Swagger UI provides an interactive interface to explore and test the API.

### Accessing Swagger UI

1. **Start the Django development server** (if not already running):
   ```bash
   cd backend
   make start
   ```

2. **Open Swagger UI in your browser:**
   ```
   http://localhost:8000/api/docs/
   ```

### Authenticating in Swagger UI

1. **Click the "Authorize" button** (🔓 lock icon) at the top right of the Swagger UI page

2. **Enter your token** in the following format:
   ```
   Token your_authentication_token_here
   ```
   
   Example:
   ```
   Token 9f0ae9d697dd662288d5b018fb8a9c629a4868b07e3efbc91d179da0e2a8494c
   ```

3. **Click "Authorize"** then **"Close"**

4. **The lock icon will now be closed (🔒)** indicating you're authenticated

### Testing Endpoints

1. **Browse available endpoints** in the Swagger UI interface

2. **Click on any endpoint** to expand it

3. **Click "Try it out"** to enable the test interface

4. **Fill in any required parameters**

5. **Click "Execute"** to send the request

6. **View the response** below the Execute button, including:
   - HTTP status code
   - Response body (JSON)
   - Response headers

### Example: Listing Projects

1. Navigate to `GET /api/projects/`
2. Click "Try it out"
3. (Optional) Add query parameters like `?page=1&hub=erlangen`
4. Click "Execute"
5. See the list of projects in the response

---

## Using the API with Postman

Postman is a popular API client for testing and development.

### Importing the OpenAPI Schema

1. **Open Postman**

2. **Click "Import"** in the top left

3. **Choose "Link"** tab

4. **Enter the schema URL:**
   ```
   http://localhost:8000/api/schema/
   ```

5. **Click "Continue"** then **"Import"**

6. **All API endpoints** will now be available in your Postman collections

### Setting Up Authentication

#### Option A: Collection-Level Authorization (Recommended)

1. **Right-click the imported collection** → **Edit**

2. **Go to the "Authorization" tab**

3. **Select Type:** `API Key`

4. **Configure:**
   - **Key**: `Authorization`
   - **Value**: `Token your_authentication_token_here`
   - **Add to**: `Header`

5. **Click "Save"**

All requests in the collection will now automatically include your token.

#### Option B: Request-Level Authorization

For individual requests:

1. **Select a request**

2. **Go to the "Headers" tab**

3. **Add a new header:**
   - **Key**: `Authorization`
   - **Value**: `Token your_authentication_token_here`

### Testing Endpoints

1. **Select an endpoint** from the imported collection

2. **Review the pre-filled URL and parameters**

3. **Click "Send"**

4. **View the response** in the lower panel

### Example: Getting Your Profile

1. Select `GET {{baseUrl}}/api/my_profile/`
2. Ensure authorization is configured
3. Click "Send"
4. Your profile data will appear in the response

---

## Using the API with curl

For command-line API testing, use curl:

### Basic Authenticated Request

```bash
curl -H "Authorization: Token your_authentication_token_here" \
  http://localhost:8000/api/my_profile/
```

### POST Request Example (Creating a Project)

```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Token your_authentication_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Community Solar Project",
    "description": "Installing solar panels in our neighborhood",
    "location": {
      "city": "Berlin",
      "country": "Germany"
    }
  }'
```

### GET Request with Query Parameters

```bash
curl -H "Authorization: Token your_authentication_token_here" \
  "http://localhost:8000/api/projects/?page=1&search=solar&hub=berlin"
```

---

## API Authentication

### Authentication Methods

ClimateConnect API supports two authentication methods:

1. **Knox Token Authentication** (recommended for API access)
   ```
   Authorization: Token your_token_here
   ```

2. **Session Authentication** (used by the frontend)
   - Automatically handled by Django sessions
   - Uses cookies for authentication

### Public vs. Authenticated Endpoints

#### Public Endpoints (No token required)

- `GET /api/projects/` - List projects
- `GET /api/organizations/` - List organizations
- `GET /api/members/` - List members
- `GET /api/hubs/` - List hubs
- `GET /api/about_faq/` - FAQ content
- `GET /api/schema/` - OpenAPI schema
- `GET /api/docs/` - Swagger UI

#### Authenticated Endpoints (Token required)

- `GET /api/my_profile/` - Your profile
- `POST /api/projects/` - Create project
- `PUT /api/projects/{slug}/` - Update project
- `POST /api/send_message/` - Send chat message
- `GET /api/notifications/` - Your notifications
- Most `POST`, `PUT`, `PATCH`, `DELETE` operations

### Checking If Authentication Is Required

In Swagger UI, endpoints with a 🔒 lock icon require authentication.

---

## Common Endpoints

### Projects

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/projects/` | GET | No | List all projects |
| `/api/projects/` | POST | Yes | Create a new project |
| `/api/projects/{slug}/` | GET | No | Get project details |
| `/api/projects/{slug}/` | PATCH | Yes | Update a project |
| `/api/projects/{slug}/members/` | GET | No | List project members |
| `/api/projects/{slug}/register/` | POST | Yes | Register authenticated user for event |
| `/api/projects/{slug}/registration/` | PATCH | Yes | Update event registration settings (organiser only) |

#### Event Registration (`event_registration`)

Event-type projects expose an optional nested `event_registration` object on all project endpoints. For non-event projects the field is always `null`.

**Response shape — detail** (`GET /api/projects/{slug}/`):
```json
{
  "event_registration": {
    "max_participants": 100,
    "registration_end_date": "2026-06-01T23:59:00Z",
    "status": "open",
    "available_seats": 42
  }
}
```
`available_seats` is `null` when `max_participants` is `null` (unlimited capacity).

**Response shape — list** (`GET /api/projects/`):
```json
{
  "event_registration": {
    "max_participants": 100,
    "registration_end_date": "2026-06-01T23:59:00Z",
    "status": "open",
    "available_seats": null
  }
}
```
`available_seats` is always `null` in list responses to avoid a `COUNT(*)` query per row.

Returns `null` when registration is not enabled.

**Request body** (`POST /api/projects/` and `PATCH /api/projects/{slug}/`):
```json
{
  "event_registration": {
    "max_participants": 100,
    "registration_end_date": "2026-06-01T23:59:00Z",
    "status": "closed"
  }
}
```
Omitting the `event_registration` key entirely on `PATCH` leaves existing settings untouched.

**Validation rules**:
| Rule | Enforced when |
|---|---|
| Only allowed for `project_type = event` | Always |
| `max_participants` must be > 0 | Always (when value is provided) |
| `registration_end_date` must be ≤ event `end_date` | Always (when both are present) |
| Both fields are required | On publish (`is_draft=false`) only |
| Both fields are optional / nullable | When saving as draft (`is_draft=true`) |
| `status` must be `open` or `closed` (not `full`) | Always on write |

**Registration status** (`status` field):
| Value | Who sets it | Meaning |
|---|---|---|
| `open` | Default / organiser | Accepting sign-ups (subject to `registration_end_date` and `max_participants`) |
| `closed` | Organiser via `PATCH` | Manually closed before the end date; can be re-opened with `"status": "open"` |
| `full` | System only | Capacity reached — cannot be set via the API directly |
| `ended` | Computed (read-only) | `registration_end_date` has passed while the stored status was `open` — returned by the API but never stored in the DB |

Effective "accepting signups?" check: `status == "open" AND now() < registration_end_date`

> **Note**: `ended` is a computed value derived from the stored `open` status and a past `registration_end_date`. It is never written to the database — the underlying stored status remains `open`. Clients should treat `ended`, `closed`, and `full` equally as "not accepting sign-ups".

**Timezone**: `registration_end_date` follows the same convention as `Project.start_date` / `end_date`. Send ISO 8601 strings with an explicit offset or `Z` suffix (e.g. `"2026-06-01T23:59:00Z"`); the backend stores and compares in UTC.

**Feature toggle**: The registration UI is gated behind the `EVENT_REGISTRATION` feature toggle. The API fields are always present (additive, no breaking changes).

#### POST `/api/projects/{slug}/register/` — Register for an event

Registers the authenticated user as a participant for an event that has `EventRegistration` enabled.

**Authentication**: Required (401 if unauthenticated)

**Success responses**:
| Status | Condition |
|---|---|
| 201 Created | First-time registration — `EventParticipant` row created |
| 200 OK | Idempotent — user was already registered; no duplicate created |

**Error responses**:
| Status | Condition |
|---|---|
| 400 Bad Request | Registration is `closed` or `full` |
| 400 Bad Request | `registration_end_date` has passed |
| 400 Bad Request | Project has no `EventRegistration` record |
| 401 Unauthorized | Request is not authenticated |
| 404 Not Found | `{slug}` does not match any project |

**Response body** (both 200 and 201):
```json
{
  "registered": true,
  "available_seats": 41
}
```
`available_seats` is `null` for unlimited-capacity events (`max_participants = null`).

**Race-condition safety**: The `EventRegistration` row is locked with `SELECT FOR UPDATE` inside `@transaction.atomic`. Concurrent last-seat registrations are serialised — at most `max_participants` `EventParticipant` rows are ever created.

**FULL promotion**: When a registration fills the last seat, `EventRegistration.status` is atomically updated to `"full"` in the same transaction, so subsequent registrations are rejected immediately (no extra COUNT query needed on the hot path).

**Confirmation email**: A Celery task (`send_event_registration_confirmation_email`) is dispatched via `transaction.on_commit` after the commit succeeds. It sends an email via Mailjet using the `EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID` template (EN) or `EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID_DE` template (DE), selected based on the user's language preference. **Both templates must be created in the Mailjet dashboard before emails will be sent** — see `doc/environment-variables.md` for required template variables. Not dispatched on idempotent re-registrations.

#### PATCH `/api/projects/{slug}/registration/` — Edit registration settings (issue #1851)

Allows an event organiser (or team admin) to update `max_participants`, `registration_end_date`, and/or `status` on an event that already has `EventRegistration` enabled.

**Authentication**: Required (401 if unauthenticated). Requires edit rights on the project (organiser or team admin role) — 403 if unauthorised.

**Editable fields**:
| Field | Type | Notes |
|---|---|---|
| `max_participants` | Positive integer or `null` | Must be ≥ 1 and ≥ current participant count; `null` = unlimited |
| `registration_end_date` | ISO 8601 datetime | Must be > `now()` and ≤ event `end_date` |
| `status` | `"open"` or `"closed"` | Organiser may manually open or close registration; `"full"` and `"ended"` are system-managed and are rejected with 400 |

**Status change rules**:
| Transition | Allowed | Notes |
|---|---|---|
| `open` → `closed` | ✅ | Organiser manually closes registration |
| `closed` → `open` | ✅ | Organiser reopens — only if capacity is still available (see below) |
| `full` → `open` | ✅ | Only if current participant count < effective `max_participants` after this PATCH |
| `open/closed` → `full` | ❌ | System-managed only |
| `open/closed` → `ended` | ❌ | Computed read-only value — rejected with 400 |
| `open` when `effective_status == "ended"` | ❌ | Deadline has passed — extend `registration_end_date` first |
| `closed/full` → `open` when event is at capacity | ❌ | Event is fully booked — increase `max_participants` first (or include a higher value in the same request) |

**Idempotency**: setting `status` to its current stored value returns `200 OK` without any DB change.

**Automatic status adjustment** (triggered only when `max_participants` is in the request body AND `status` is NOT explicitly provided):
| Condition | Result |
|---|---|
| Stored status is `full` and new `max_participants` > current registrations | Auto-set to `open` (capacity raised above filled seats) |
| Stored status is `full` and `max_participants` set to `null` (unlimited) | Auto-set to `open` (unlimited capacity) |
| Stored status is `open` and new `max_participants` == current registrations | Auto-set to `full` (capacity lowered to exactly match filled seats) |

> **Priority**: if `status` is explicitly provided, it takes precedence over auto-adjustment logic. For example, `{"status": "open", "max_participants": 10}` with 10 current registrations results in `open`, not `full`.

**Request body** (all fields optional — PATCH semantics):
```json
{
  "max_participants": 80,
  "registration_end_date": "2026-07-01T18:00:00Z",
  "status": "closed"
}
```

**Success response** (200 OK):
```json
{
  "max_participants": 80,
  "registration_end_date": "2026-07-01T18:00:00Z",
  "status": "closed",
  "available_seats": 75
}
```

**Error responses**:
| Status | Condition |
|---|---|
| 400 Bad Request | `registration_end_date` is in the past |
| 400 Bad Request | `registration_end_date` is after the event's `end_date` |
| 400 Bad Request | `max_participants` is 0 or negative |
| 400 Bad Request | `max_participants` is below the current participant count |
| 400 Bad Request | `status` is `"full"` or `"ended"` (system-managed) |
| 400 Bad Request | `status = "open"` when `effective_status == "ended"` (deadline has passed — extend `registration_end_date` first) |
| 400 Bad Request | `status = "open"` when participant count ≥ effective `max_participants` (event is fully booked — increase `max_participants` first, or include a higher value in the same request) |
| 401 Unauthorized | Request is not authenticated |
| 403 Forbidden | Authenticated user without edit rights on the project |
| 404 Not Found | `{slug}` does not match any project |
| 404 Not Found | Project exists but has no `EventRegistration` record |

**Validation note**: guards are only applied to fields explicitly included in the request body. A PATCH that sends only `max_participants` does not re-validate the stored `registration_end_date`, and vice versa.

**Existing endpoint unchanged**: `PATCH /api/projects/{slug}/` is not affected.

### Organizations

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/organizations/` | GET | No | List all organizations |
| `/api/organizations/` | POST | Yes | Create an organization |
| `/api/organizations/{slug}/` | GET | No | Get organization details |
| `/api/organizations/{slug}/members/` | GET | No | List organization members |

### Members

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/members/` | GET | No | List all members |
| `/api/member/{url_slug}/` | GET | No | Get member profile |
| `/api/my_profile/` | GET | Yes | Get your own profile |
| `/api/edit_profile/` | POST | Yes | Update your profile |

### Hubs

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/hubs/` | GET | No | List all hubs |
| `/api/hubs/{hub_slug}/` | GET | No | Get hub details |

### Ideas

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/ideas/` | GET | No | List all ideas |
| `/api/ideas/` | POST | Yes | Create a new idea |
| `/api/ideas/{url_slug}/` | GET | No | Get idea details |

---

## Troubleshooting

### Common Issues

#### "Invalid token" Error

**Problem**: API returns `401 Unauthorized` or "Invalid token"

**Solutions**:
- Verify you're using the correct token format: `Token your_token_here`
- Ensure there's a space between "Token" and your actual token
- Check that the token hasn't expired (default: 120 days)
- Generate a new token if needed

#### "Authentication credentials were not provided"

**Problem**: Endpoint requires authentication but no token was sent

**Solutions**:
- Add the `Authorization` header to your request
- In Swagger UI, click "Authorize" and enter your token
- In Postman, configure authorization in the Headers or Authorization tab

#### "Profile not found" Error

**Problem**: `GET /api/my_profile/` returns "Profile not found"

**Explanation**: The user account exists but doesn't have an associated UserProfile yet.

**Solution**: Create a UserProfile through the Django admin or signup flow.

#### CORS Errors (Browser)

**Problem**: Browser shows CORS policy errors

**Explanation**: Cross-Origin Resource Sharing (CORS) restrictions apply when calling the API from a different domain.

**Solution**: For local development, the backend is configured to allow `http://localhost:3000`. For other origins, update `CORS_ORIGIN_WHITELIST` in `settings.py`.

#### Connection Refused

**Problem**: Cannot connect to `http://localhost:8000`

**Solutions**:
- Ensure the Django development server is running: `cd backend && make start`
- Check if another process is using port 8000: `lsof -ti:8000`
- Verify you're using the correct URL (localhost vs. 127.0.0.1)

---

## Additional Resources

- **API Schema (OpenAPI)**: http://localhost:8000/api/schema/ - Download the full API specification
- **Django REST Framework**: https://www.django-rest-framework.org/ - API framework documentation
- **Knox Authentication**: https://github.com/jazzband/django-rest-knox - Token authentication documentation
- **ClimateConnect Repository**: https://github.com/climateconnect/climateconnect - Source code and issues

---

## Need Help?

If you encounter issues or have questions about the API:

1. Check the [ClimateConnect GitHub Issues](https://github.com/climateconnect/climateconnect/issues)
2. Review the backend code in `backend/climateconnect_api/views/`
3. Ask in the development team channels

---

**Last Updated**: March 31, 2026 — Added fully-booked reopen guard to `PATCH /api/projects/{slug}/registration/`: `status = "open"` is now rejected with `400 Bad Request` when participant count ≥ effective `max_participants` after this PATCH (applies to both `closed → open` and `full → open` transitions when the event is actually at capacity). An organiser can reopen a booked-out event by including a higher `max_participants` in the same request. Three new tests added. Previous: March 31, 2026 — `PATCH /api/projects/{slug}/registration/` updated (issue #1851): `status` is now writable (`"open"` / `"closed"`); `"full"` and `"ended"` are rejected with 400 (system-managed); reopen guard returns 400 when `effective_status == "ended"` (extend deadline first); auto-adjustment skipped when `status` is explicit. Previous: March 31, 2026 — `PATCH /api/projects/{slug}/registration/` now returns `available_seats` in the response body (always computed). Previous: March 31, 2026 — Added status auto-adjustment to `PATCH /api/projects/{slug}/registration/`. Previous: March 31, 2026 — Added computed `"ended"` status to `event_registration.status`. Previous: March 30, 2026 — Added `PATCH /api/projects/{slug}/registration/` endpoint (issue #1848). Previous: March 30, 2026 — Added `POST /api/projects/{slug}/register/` endpoint (issue #1845). Previous: March 19, 2026 — Added `status` field to `event_registration`. Previous: Added `event_registration` nested object to project endpoints (issue #43)

