# ENV variable setup

The following is a list of `.backend_env` variables required to run the server locally.

This sample snippet includes sensible defaults where possible -- modify as needed and basic use double quotes for all values:

```
FRONTEND_URL="http://localhost:3001"

# Django secret key
SECRET_KEY="e.g. output of $ openssl rand -base64 32"

ALLOWED_HOSTS="http://localhost:8000"
ENVIRONMENT="development or production"

# Absolute path to climateconnect/backend/media
MEDIA_ROOT="/home/user/climateconnect_env/climateconnect/backend/media"
DEBUG=True
AUTO_VERIFY=True

CACHE_BACHED_RANK_REQUEST=true

# Url of location geocoding API
LOCATION_SERVICE_BASE_URL=""
ENABLE_LEGACY_LOCATION_FORMAT="Set to True to disable usage of geocoding API"

CELERY_BROKER_URL="redis://127.0.0.1"
```

The following should correspond to how you've configured your _Postgres_ database:

```
DATABASE_NAME="climateconnect-dev"
DATABASE_USER="DATABASE_PASSWORD"
DATABASE_HOST="localhost"
DATABASE_PORT="5432"
```

This should correspond to your redis setup

```
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# The full redis url build out of the 3 above variables
REDIS_URL="redis://localhost"
```

Env variables needed for email sending with [mailjet](https://www.mailjet.com/):

```
EMAIL_HOST="YOUR EMAIL HOST"
EMAIL_HOST_USER="EMAIL CLIENT USER"
EMAIL_HOST_PASSWORD="EMAIL CLIENT PASSWORD"
EMAIL_PORT="EMAIL PORT"

MJ_APIKEY_PUBLIC="API key public"
MJ_APIKEY_PRIVATE="API secret"
EMAIL_VERIFICATION_TEMPLATE_ID="TEMPLATE ID"
NEW_EMAIL_VERIFICATION_TEMPLATE_ID="TEMPLATE ID"
RESET_PASSWORD_TEMPLATE_ID="TEMPLATE ID"
FEEDBACK_TEMPLATE_ID="TEMPLATE ID"
PRIVATE_MESSAGE_TEMPLATE_ID="TEMPLATE ID"
GROUP_MESSAGE_TEMPLATE_ID="TEMPLATE ID"
PROJECT_COMMENT_TEMPLATE_ID="TEMPLATE ID"
PROJECT_COMMENT_REPLY_TEMPLATE_ID="TEMPLATE ID"
PROJECT_FOLLOWER_TEMPLATE_ID="TEMPLATE ID"
PROJECT_LIKE_TEMPLATE_ID="TEMPLATE ID"
MAILJET_NEWSLETTER_LIST_ID="LIST ID"


CLIMATE_CONNECT_SUPPORT_EMAIL="SUPPORT EMAIL"
```
