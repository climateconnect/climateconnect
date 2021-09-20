# ENV variable setup

The following is a list of `.backend_env` variables required to run the server locally.

Basic env variables which you will need for initial setup:
(use double quotes for all values)

```
FRONTEND_URL=<your frontend URL eg: http://localhost:3001>
SECRET_KEY=<Django secret-key e.g. output of $ openssl rand -base64 32>

ALLOWED_HOSTS=<hosts allowed. eg: http://localhost:8000>
ENVIRONMENT=<Environment you are in, eg: development>

DEBUG=<Set to True, locally>
AUTO_VERIFY=<Set to True, locally>
LOCATION_SERVICE_BASE_URL=<Url of location geocoding API>
ENABLE_LEGACY_LOCATION_FORMAT=<Set to True to disable usage of geocoding API>
CELERY_BROKER_URL=<Set celery broker url, eg: "redis://127.0.0.1">
```

The following should correspond to how you've configured your Postgres database:

```
DATABASE_NAME=<database name e.g. climateconnect-dev>
DATABASE_USER=<database user>
DATABASE_PASSWORD=<database role password>
DATABASE_HOST=<database host e.g. localhost>
DATABASE_PORT=<database port e.g. 5432>
```

Env variables needed for email sending with [mailjet](https://www.mailjet.com/):

```EMAIL_HOST=<YOUR EMAIL HOST>
EMAIL_HOST_USER=<EMAIL CLIENT USER>
EMAIL_HOST_PASSWORD=<EMAIL CLIENT PASSWORD>
EMAIL_PORT=<EMAIL PORT>

MJ_APIKEY_PUBLIC=<API key public>
MJ_APIKEY_PRIVATE=<API secret>
EMAIL_VERIFICATION_TEMPLATE_ID=<TEMPLATE ID>
NEW_EMAIL_VERIFICATION_TEMPLATE_ID=<TEMPLATE ID>
RESET_PASSWORD_TEMPLATE_ID=<TEMPLATE ID>
FEEDBACK_TEMPLATE_ID=<TEMPLATE ID>
PRIVATE_MESSAGE_TEMPLATE_ID=<TEMPLATE ID>
GROUP_MESSAGE_TEMPLATE_ID=<TEMPLATE ID>
PROJECT_COMMENT_TEMPLATE_ID=<TEMPLATE ID>
PROJECT_COMMENT_REPLY_TEMPLATE_ID=<TEMPLATE ID>
PROJECT_FOLLOWER_TEMPLATE_ID=<TEMPLATE ID>
MAILJET_NEWSLETTER_LIST_ID=<LIST ID>


CLIMATE_CONNECT_SUPPORT_EMAIL=<SUPPORT EMAIL>
```
