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

### Auth

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/check-email` | POST | No | Check whether an email is new or returning (US-2b) |
| `/api/auth/request-token` | POST | No | Request a 6-digit OTP login code by email (US-3) |
| `/api/auth/verify-token` | POST | No | Verify the OTP code and receive a Knox auth token (US-4) |

#### POST `/api/auth/verify-token` — Verify OTP code and issue Knox token

Validates the 6-digit code the user received by email and, on success, issues an authenticated Knox token. This is the final step of the OTP login flow. Also serves the new-user account verification use case: when a new user completes signup and verifies their inbox via OTP, `is_profile_verified` is set to `True` atomically with the Knox token issuance.

**Authentication**: Not required (`AllowAny`).

**Request body**:
```json
{
  "session_key": "a3f8...64-char hex string",
  "code": "123456"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `session_key` | string | Yes | The `session_key` returned by `POST /api/auth/request-token` |
| `code` | string | Yes | The 6-digit code from the email |

**Success response** (200 OK):
```json
{
  "token": "<knox raw token>",
  "expiry": "2026-08-19T09:00:00Z",
  "user": { ... }
}
```
The `user` object uses the same `PersonalProfileSerializer` shape as `POST /login/`. The Knox `token` is a long alphanumeric string; `expiry` is an ISO 8601 datetime.

**Validation order**: checks are enforced sequentially — expired → already used → attempt limit → code hash. The first failing check returns immediately.

**Error responses**:
| Status | `detail` | Condition |
|--------|----------|-----------|
| 400 Bad Request | Field error | `session_key` or `code` missing or blank |
| 401 Unauthorized | `"Invalid or expired session."` | `session_key` not found |
| 401 Unauthorized | `"This code has expired. Please request a new one."` | Token `expires_at` is in the past |
| 401 Unauthorized | `"Invalid or expired session."` | Token already used (`used_at` is set) |
| 401 Unauthorized | `"Too many failed attempts. Please request a new code."` | `attempt_count ≥ 5` before submission |
| 401 Unauthorized | `"Invalid code. N attempt(s) remaining."` | Wrong code; N attempts left |
| 401 Unauthorized | `"Too many failed attempts. Please request a new code."` | Wrong code pushed `attempt_count` to 5 |
| 401 Unauthorized | `"Invalid or expired session."` | Race condition: concurrent request consumed the same token first |

**Security notes**:
- Code comparison uses `hmac.compare_digest` (constant-time) to prevent timing attacks.
- Failed attempts are incremented with a DB-level `F("attempt_count") + 1` expression to avoid read-modify-write races.
- The single-use guard uses `UPDATE … WHERE used_at IS NULL` and checks affected rows — if two concurrent requests both pass the checks, only the first one gets a Knox token; the second receives 401.
- IP address is anonymised (last octet zeroed for IPv4) before being stored in `LoginAuditLog`.

**Audit logging**: `LoginAuditLog` is written on every call regardless of outcome (`verified`, `failed`, `expired`, `exhausted`).

**New-user verification**: if `UserProfile.is_profile_verified` is `False` at success time, it is set to `True` before the Knox token is created. No separate email-link verification step is needed.

**curl example**:
```bash
curl -X POST http://localhost:8000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"session_key": "a3f8...", "code": "123456"}'
```

---

### Projects

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/projects/` | GET | No | List all projects |
| `/api/projects/` | POST | Yes | Create a new project |
| `/api/projects/{slug}/` | GET | No | Get project details |
| `/api/projects/{slug}/` | PATCH | Yes | Update a project |
| `/api/projects/{slug}/members/` | GET | No | List project members |
| `/api/projects/{slug}/registrations/` | POST | Yes | Register authenticated user for event |
| `/api/projects/{slug}/registration-config/` | PATCH | Yes | Update event registration settings (organiser only) |
| `/api/projects/{slug}/registrations/` | GET | Yes | List all registrations for an event (organiser/admin only) |
| `/api/projects/{slug}/registrations/` | DELETE | Yes | Cancel own registration (member self-cancellation) |
| `/api/projects/{slug}/registrations/{id}/` | DELETE | Yes | Cancel a specific guest's registration (organiser/admin only) |
| `/api/projects/{slug}/registrations/email/` | POST | Yes | Send email to all active guests (organiser/admin only) |

#### Event Registration (`registration_config`)

Event-type projects expose an optional nested `registration_config` object on all project endpoints. For non-event projects the field is always `null`.

**Response shape — detail** (`GET /api/projects/{slug}/`):
```json
{
  "registration_config": {
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
  "registration_config": {
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
  "registration_config": {
    "max_participants": 100,
    "registration_end_date": "2026-06-01T23:59:00Z",
    "status": "closed"
  }
}
```
Omitting the `registration_config` key entirely on `PATCH` leaves existing settings untouched.

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

#### POST `/api/projects/{slug}/registrations/` — Register for an event

Registers the authenticated user as a participant for an event that has `EventRegistrationConfig` enabled.

**Authentication**: Required (401 if unauthenticated)

**Re-registration**: if the user previously cancelled their own registration (`cancelled_by == user`), `POST` resets `cancelled_at` and `cancelled_by` to `null` on the existing row and re-activates the registration (201 Created). If the registration was cancelled by an admin (`cancelled_by != user`), re-registration is blocked (403 Forbidden).

**Success responses**:
| Status | Condition |
|---|---|
| 201 Created | First-time registration or re-registration after self-cancellation |
| 200 OK | Idempotent — user already has an active registration; no duplicate created |

**Error responses**:
| Status | Condition |
|---|---|
| 400 Bad Request | Registration is `closed` or `full` |
| 400 Bad Request | `registration_end_date` has passed |
| 400 Bad Request | Project has no `EventRegistrationConfig` record |
| 401 Unauthorized | Request is not authenticated |
| 403 Forbidden | Registration was cancelled by an admin — member may not self-re-register |
| 404 Not Found | `{slug}` does not match any project |

**Response body** (both 200 and 201):
```json
{
  "registered": true,
  "available_seats": 41
}
```
`available_seats` is `null` for unlimited-capacity events (`max_participants = null`). Only active (non-cancelled) registrations count against capacity.

**Race-condition safety**: The `EventRegistrationConfig` row is locked with `SELECT FOR UPDATE` inside `@transaction.atomic`. Concurrent last-seat registrations are serialised — at most `max_participants` `EventRegistration` rows are ever active at the same time.

**FULL promotion**: When a registration fills the last seat, `EventRegistrationConfig.status` is atomically updated to `"full"` in the same transaction, so subsequent registrations are rejected immediately (no extra COUNT query needed on the hot path).

**Confirmation email**: A Celery task (`send_event_registration_confirmation_email`) is dispatched via `transaction.on_commit` after the commit succeeds. It sends an email via Mailjet using the `EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID` template (EN) or `EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID_DE` template (DE), selected based on the user's language preference. **Both templates must be created in the Mailjet dashboard before emails will be sent** — see `doc/environment-variables.md` for required template variables. Not dispatched on idempotent re-registrations (200 OK).

#### DELETE `/api/projects/{slug}/registrations/` — Cancel own registration (issue #1850)

Allows the authenticated member to cancel their own registration for an upcoming event. This is a **soft delete** — the `EventRegistration` row is kept and `cancelled_at` / `cancelled_by` are set. The member may re-register later (unless an admin cancels their re-registration).

**Authentication**: Required (401 if unauthenticated).

**Success response**: 204 No Content (no body).

**Error responses**:
| Status | Condition |
|---|---|
| 400 Bad Request | Event `start_date` has already passed |
| 401 Unauthorized | Request is not authenticated |
| 404 Not Found | `{slug}` does not match any project |
| 404 Not Found | Project has no `EventRegistrationConfig` record |
| 404 Not Found | User has no active registration for this event |

**OPEN recovery**: if the event was at full capacity (`status = "full"`) and this cancellation frees a seat, `EventRegistrationConfig.status` is atomically reverted to `"open"`.

**Seat count**: all places that compute `available_seats` filter by `cancelled_at IS NULL` so cancelled registrations never hold capacity.

#### PATCH `/api/projects/{slug}/registration-config/` — Edit registration settings (issue #1851)

Allows an event organiser (or team admin) to update `max_participants`, `registration_end_date`, and/or `status` on an event that already has `EventRegistrationConfig` enabled.

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
| 404 Not Found | Project exists but has no `EventRegistrationConfig` record |

**Validation note**: guards are only applied to fields explicitly included in the request body. A PATCH that sends only `max_participants` does not re-validate the stored `registration_end_date`, and vice versa.

**Existing endpoint unchanged**: `PATCH /api/projects/{slug}/` is not affected.

#### GET `/api/projects/{slug}/registrations/` — List event registrations (organiser view)

Returns **all** `EventRegistration` rows (active and cancelled) for an event that has `EventRegistrationConfig` enabled.
Intended for organisers / team admins to review their guest list and manage cancellations.

**Authentication**: Required (401 if unauthenticated). Requires organiser or team admin role (`role_type` in `["all", "read write"]`) — 403 if unauthorised.

**No pagination**: all rows are returned in a single response. Client-side paging is provided by the MUI DataGrid in the frontend.

**Default ordering**: `registered_at` ascending (chronological).

**Success response** (200 OK):
```json
[
  {
    "id": 42,
    "user_first_name": "Alice",
    "user_last_name": "Smith",
    "user_url_slug": "alice-smith",
    "user_thumbnail_image": "https://.../thumb_alice.jpg",
    "registered_at": "2026-05-10T14:23:00Z",
    "cancelled_at": null
  },
  {
    "id": 43,
    "user_first_name": "Bob",
    "user_last_name": "Jones",
    "user_url_slug": "bob-jones",
    "user_thumbnail_image": null,
    "registered_at": "2026-05-11T09:00:00Z",
    "cancelled_at": "2026-05-15T10:30:00Z"
  }
]
```
- `id` — the `EventRegistration` primary key, used for admin-cancellation (`DELETE /registrations/{id}/`).
- `cancelled_at` — `null` for active registrations; ISO 8601 timestamp for cancelled ones.
- `user_thumbnail_image` is `null` when the participant has no profile image.

**Error responses**:
| Status | Condition |
|---|---|
| 401 Unauthorized | Request is not authenticated |
| 403 Forbidden | Authenticated user without edit rights on the project |
| 404 Not Found | `{slug}` does not match any project |
| 404 Not Found | Project exists but has no `EventRegistrationConfig` record |

**Query optimisation**: the queryset uses `select_related("user__user_profile")` — all participant data is fetched in a single SQL JOIN, regardless of participant count.

#### PATCH `/api/projects/{slug}/registrations/{id}/` — Admin cancel guest registration (issue #1872)

Allows an event organiser or team admin to cancel a specific guest's registration. This is a **soft delete** — `cancelled_at` and `cancelled_by` are set on the row. The guest cannot self-re-register after an admin cancellation.

**Authentication**: Required (401 if unauthenticated). Requires organiser or team admin role — 403 if unauthorised.

**Request body** (optional):
```json
{ "message": "Unfortunately, your registration has been cancelled due to capacity changes." }
```
When `message` is provided (non-empty), a cancellation notification email is sent to the guest via `send_guest_cancellation_notification`. If absent or blank, no email is sent. The cancellation is committed regardless of email delivery — an email failure is logged but does not roll back the cancellation.

**Success response**: 204 No Content (no body).

**Error responses**:
| Status | Condition |
|---|---|
| 400 Bad Request | Registration `{id}` is already cancelled |
| 401 Unauthorized | Request is not authenticated |
| 403 Forbidden | Authenticated user without edit rights on the project |
| 404 Not Found | `{slug}` does not match any project |
| 404 Not Found | Project has no `EventRegistrationConfig` record |
| 404 Not Found | `{id}` does not exist or does not belong to this project |

**OPEN recovery**: if the event was at full capacity (`status = "full"`) and this cancellation frees a seat, `EventRegistrationConfig.status` is atomically reverted to `"open"`.

**Notification email**: uses Mailjet templates `ADMIN_CANCEL_REGISTRATION_TEMPLATE_ID` (EN) / `ADMIN_CANCEL_REGISTRATION_TEMPLATE_ID_DE` (DE). No email is sent if these are not configured — see `doc/environment-variables.md`.

#### POST `/api/projects/{slug}/registrations/email/` — Send organiser email to guests

Sends a plain-text email authored by the organiser to all active registered guests
(`is_test=false`) or a single test copy to the authenticated organiser (`is_test=true`).

**Authentication**: Required (401 if unauthenticated). Requires organiser or team admin role — 403 if unauthorised.

**Request body**:
```json
{
  "subject": "Important update about the event",
  "message": "Hi everyone, we have an important update…",
  "is_test": false
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `subject` | string | Yes | max 200 chars, non-blank |
| `message` | string | Yes | non-blank |
| `is_test` | boolean | No | defaults to `false` |

**Success response** (200 OK):
```json
{ "sent_count": 42 }
```
`sent_count` is the number of active participants at request time. For `is_test=true` it is always `1`. Bulk delivery is asynchronous (Celery task); the HTTP response returns immediately.

When `is_test=true`, the subject is prefixed with `[TEST] ` so the organiser can identify the test email in their inbox.

**Error responses**:
| Status | Condition |
|--------|-----------|
| 400 Bad Request | `subject` or `message` is blank or missing |
| 400 Bad Request | `subject` exceeds 200 characters |
| 401 Unauthorized | Request is not authenticated |
| 403 Forbidden | Authenticated user without edit rights on the project |
| 404 Not Found | `{slug}` does not match any project |
| 404 Not Found | Project exists but has no `EventRegistrationConfig` record |

**Implementation notes**:
- Bulk send dispatches `send_organizer_message_to_guests` Celery task with a pre-computed snapshot of `user_id` values for **active (non-cancelled)** registrations only, isolating it from concurrent registration changes.
- Test send is synchronous — one email, inline in the HTTP request.
- Uses Mailjet templates `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` (EN) and `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE` (DE). No emails are sent until these are configured — see `doc/environment-variables.md`.

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

**Last Updated**: April 21, 2026 — Added `POST /api/auth/verify-token` endpoint (US-4). Accepts `{ session_key, code }`. On success returns `{ token, expiry, user }` (Knox token + `PersonalProfileSerializer` user shape). Validates in order: expiry → single-use → attempt limit → constant-time hash comparison. Failed attempts incremented atomically via `F()` expression; response includes remaining attempts or locked message. Race condition guard via `UPDATE … WHERE used_at IS NULL` affected-rows check. New users (`is_profile_verified=False`) are marked verified atomically with Knox token issuance. `LoginAuditLog` written on every outcome (`verified`, `failed`, `expired`, `exhausted`). Added Auth section to Common Endpoints listing all three OTP-flow endpoints. Previous: April 21, 2026 — Added `POST /api/auth/request-token` endpoint (US-3). Accepts `{ email }`, always returns HTTP 200 with `{ session_key }` (enumeration-safe). Generates a cryptographically secure 6-digit OTP (SHA-256 hash stored only), ties it to a browser tab via a 64-char hex `session_key`, and enqueues `send_login_code_email` Celery task. Invalidates any previous active `LoginToken` for the same email before creating the new one. Resend cooldown: 429 with `Retry-After` if a token was created in the last 60 s. Rate limits: 3 req/10 min per email (`Retry-After: 600`), 30 req/h per IP (`Retry-After: 3600`). Writes a `LoginAuditLog` entry (outcome `requested` or `resent`) on every call, including when email is not found. Requires no authentication (`AllowAny`). New settings: `LOGIN_CODE_EMAIL_TEMPLATE_ID`, `LOGIN_CODE_EMAIL_TEMPLATE_ID_DE` (default blank; dev fallback logs OTP to console). Previous: April 20, 2026 — Added `POST /api/auth/check-email` endpoint (US-2b). Returns `{ user_status: "new" | "returning_password" | "returning_otp" }` based on whether the email exists and which `auth_method` the `UserProfile` has. Always HTTP 200. Rate-limited to 20 requests/hour/IP (HTTP 429 + `Retry-After: 3600` on breach). Requires no authentication (`AllowAny`). Backend lookup is case-sensitive; frontend must lowercase before calling. Previous: April 9, 2026 — Added member self-cancellation (`DELETE /api/projects/{slug}/registrations/`, issue #1850) and admin cancel guest (`DELETE /api/projects/{slug}/registrations/{id}/`, issue #1872). `EventRegistrationSerializer` now includes `id` and `cancelled_at`. `GET /registrations/` returns all rows (active + cancelled). `POST /registrations/` supports re-registration after self-cancellation (201) and blocks re-registration after admin-cancellation (403). All seat-count queries filter `cancelled_at IS NULL`. `GET /projects/{slug}/my_interactions/` now returns `has_attended` and `admin_cancelled` booleans; `is_registered` filtered by `cancelled_at IS NULL`. Bulk email endpoint now excludes cancelled registrations. New Mailjet templates: `ADMIN_CANCEL_REGISTRATION_TEMPLATE_ID` (EN/DE). Previous: April 2, 2026 — Renamed API surface: `POST /api/projects/{slug}/register/` → `POST /api/projects/{slug}/registrations/`; `PATCH /api/projects/{slug}/registration/` → `PATCH /api/projects/{slug}/registration-config/`; JSON key `event_registration` → `registration_config` on all project endpoints. Previous: March 31, 2026 — Added fully-booked reopen guard to `PATCH /api/projects/{slug}/registration-config/`: `status = "open"` is now rejected with `400 Bad Request` when participant count ≥ effective `max_participants` after this PATCH (applies to both `closed → open` and `full → open` transitions when the event is actually at capacity). An organiser can reopen a booked-out event by including a higher `max_participants` in the same request. Three new tests added. Previous: March 31, 2026 — `PATCH /api/projects/{slug}/registration-config/` updated (issue #1851): `status` is now writable (`"open"` / `"closed"`); `"full"` and `"ended"` are rejected with 400 (system-managed); reopen guard returns 400 when `effective_status == "ended"` (extend deadline first); auto-adjustment skipped when `status` is explicit. Previous: March 31, 2026 — `PATCH /api/projects/{slug}/registration-config/` now returns `available_seats` in the response body (always computed). Previous: March 31, 2026 — Added status auto-adjustment to `PATCH /api/projects/{slug}/registration-config/`. Previous: March 31, 2026 — Added computed `"ended"` status to `registration_config.status`. Previous: March 30, 2026 — Added `PATCH /api/projects/{slug}/registration-config/` endpoint (issue #1848). Previous: March 30, 2026 — Added `POST /api/projects/{slug}/registrations/` endpoint (issue #1845). Previous: March 19, 2026 — Added `status` field to `registration_config`. Previous: Added `registration_config` nested object to project endpoints (issue #43)

