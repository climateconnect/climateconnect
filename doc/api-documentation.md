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
- **Production**: `https://climateconnect.earth`

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
| `/api/projects/{slug}/` | PUT | Yes | Update a project |
| `/api/projects/{slug}/members/` | GET | No | List project members |

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

**Last Updated**: January 14, 2026

