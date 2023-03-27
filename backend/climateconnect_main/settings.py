"""
Django settings for climateconnect_main project.

Generated by 'django-admin startproject' using Django 2.2.11.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os
import ssl
from datetime import timedelta

from dotenv import find_dotenv, load_dotenv

from climateconnect_main.utility.general import get_allowed_hosts
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.celery import CeleryIntegration


load_dotenv(find_dotenv(".backend_env"))


env = os.environ.get

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env("DEBUG", False)

ALLOWED_HOSTS = get_allowed_hosts(env("ALLOWED_HOSTS"))

INTERNAL_IPS = [
    # ...
    "127.0.0.1",
    # ...
]


AUTO_VERIFY = True if env("AUTO_VERIFY") in ["True", "true", "TRUE"] else False

# Application definition

CUSTOM_APPS = [
    "climateconnect_api",
    "organization",
    "chat_messages",
    "hubs",
    "location",
    "ideas",
    "climate_match",
]

LIBRARY_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "knox",
    "corsheaders",
    "channels",
    "django_filters",
    "django.contrib.gis",
    "django_celery_beat",
]

DEBUG_APPS = ["debug_toolbar"]

SECURITY_MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
]

DEBUG_MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"]

NORMAL_MIDDLEWARE = [
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

if env("DEBUG"):
    INSTALLED_APPS = CUSTOM_APPS + LIBRARY_APPS + DEBUG_APPS
    MIDDLEWARE = SECURITY_MIDDLEWARE + DEBUG_MIDDLEWARE + NORMAL_MIDDLEWARE
else:
    INSTALLED_APPS = CUSTOM_APPS + LIBRARY_APPS
    MIDDLEWARE = SECURITY_MIDDLEWARE + NORMAL_MIDDLEWARE

CORS_ORIGIN_WHITELIST = [
    "http://localhost:3000",
    "https://frontend-dot-inbound-lexicon-271522.ey.r.appspot.com",
    "https://alpha.climateconnect.earth",
    "https://climateconnect.earth",
    "https://test3425.climateconnect.earth",
    "https://www.climateconnect.earth",
    "https://www.cc-test-domain.com",
    "https://cc-test-domain.com",
    "http://cc-test-domain.com",
    "https://test-climateconnect-frontend.azurewebsites.net",
    "https://climateconnect-frontend-slot2.azurewebsites.net",
]
APPEND_SLASH = False

ROOT_URLCONF = "climateconnect_main.urls"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "climateconnect_main.wsgi.application"


# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": env("DATABASE_NAME"),
        "USER": env("DATABASE_USER"),
        "PASSWORD": env("DATABASE_PASSWORD"),
        "HOST": env("DATABASE_HOST"),
        "PORT": env("DATABASE_PORT", "5432"),
    }
}

# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/
if env("ENVIRONMENT") not in ("development", "test"):
    DEFAULT_FILE_STORAGE = "storages.backends.azure_storage.AzureStorage"
    STATICFILES_STORAGE = "storages.backends.azure_storage.AzureStorage"
    AZURE_ACCOUNT_NAME = env("AZURE_ACCOUNT_NAME")
    AZURE_ACCOUNT_KEY = env("AZURE_ACCOUNT_KEY")
    AZURE_CONTAINER = env("AZURE_CONTAINER")

STATIC_URL = (
    "/static/"
    if env("ENVIRONMENT") in ("development", "test")
    else "https://"
    + env("AZURE_ACCOUNT_NAME")
    + "."
    + env("AZURE_HOST")
    + "/{}/".format(env("AZURE_CONTAINER"))
)
STATIC_ROOT = (
    env("STATIC_ROOT") if env("ENVIRONMENT") in ("development", "test") else "static/"
)
MEDIA_ROOT = env("MEDIA_ROOT")
MEDIA_URL = "/media/"

REST_KNOX = {"TOKEN_TTL": timedelta(days=120)}
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "knox.auth.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 200,
}


MJ_APIKEY_PUBLIC = env("MJ_APIKEY_PUBLIC", "")
MJ_APIKEY_PRIVATE = env("MJ_APIKEY_PRIVATE", "")
MAILJET_NEWSLETTER_LIST_ID = env("MAILJET_NEWSLETTER_LIST_ID")
CLIMATE_CONNECT_SUPPORT_EMAIL = env("CLIMATE_CONNECT_SUPPORT_EMAIL", "")

EMAIL_VERIFICATION_TEMPLATE_ID = env("EMAIL_VERIFICATION_TEMPLATE_ID", "")
NEW_EMAIL_VERIFICATION_TEMPLATE_ID = env("NEW_EMAIL_VERIFICATION_TEMPLATE_ID", "")
NEW_EMAIL_VERIFICATION_TEMPLATE_ID_DE = env("NEW_EMAIL_VERIFICATION_TEMPLATE_ID_DE")
EMAIL_VERIFICATION_TEMPLATE_ID_DE = env("EMAIL_VERIFICATION_TEMPLATE_ID_DE")
RESET_PASSWORD_TEMPLATE_ID = env("RESET_PASSWORD_TEMPLATE_ID", "")
RESET_PASSWORD_TEMPLATE_ID_DE = env("RESET_PASSWORD_TEMPLATE_ID_DE")
FEEDBACK_TEMPLATE_ID = env("FEEDBACK_TEMPLATE_ID")
PRIVATE_MESSAGE_TEMPLATE_ID = env("PRIVATE_MESSAGE_TEMPLATE_ID")
PRIVATE_MESSAGE_TEMPLATE_ID_DE = env("PRIVATE_MESSAGE_TEMPLATE_ID_DE")
GROUP_MESSAGE_TEMPLATE_ID = env("GROUP_MESSAGE_TEMPLATE_ID")
GROUP_MESSAGE_TEMPLATE_ID_DE = env("GROUP_MESSAGE_TEMPLATE_ID_DE")
PROJECT_COMMENT_TEMPLATE_ID = env("PROJECT_COMMENT_TEMPLATE_ID")
PROJECT_MENTION_TEMPLATE_ID = env("PROJECT_MENTION_TEMPLATE_ID")
PROJECT_MENTION_TEMPLATE_ID_DE = env("PROJECT_MENTION_TEMPLATE_ID_DE")
PROJECT_COMMENT_TEMPLATE_ID_DE = env("PROJECT_COMMENT_TEMPLATE_ID_DE")
PROJECT_COMMENT_REPLY_TEMPLATE_ID = env("PROJECT_COMMENT_REPLY_TEMPLATE_ID")
PROJECT_COMMENT_REPLY_TEMPLATE_ID_DE = env("PROJECT_COMMENT_REPLY_TEMPLATE_ID_DE")
PROJECT_FOLLOWER_TEMPLATE_ID = env("PROJECT_FOLLOWER_TEMPLATE_ID")
PROJECT_FOLLOWER_TEMPLATE_ID_DE = env("PROJECT_FOLLOWER_TEMPLATE_ID_DE")
PROJECT_LIKE_TEMPLATE_ID = env("PROJECT_LIKE_TEMPLATE_ID")
PROJECT_LIKE_TEMPLATE_ID_DE = env("PROJECT_LIKE_TEMPLATE_ID_DE")
IDEA_COMMENT_TEMPLATE_ID = env("IDEA_COMMENT_TEMPLATE_ID")
IDEA_COMMENT_TEMPLATE_ID_DE = env("IDEA_COMMENT_TEMPLATE_ID_DE")
IDEA_COMMENT_REPLY_TEMPLATE_ID = env("IDEA_COMMENT_REPLY_TEMPLATE_ID")
IDEA_COMMENT_REPLY_TEMPLATE_ID_DE = env("IDEA_COMMENT_REPLY_TEMPLATE_ID_DE")
IDEA_MENTION_TEMPLATE_ID = env("IDEA_MENTION_TEMPLATE_ID")
IDEA_MENTION_TEMPLATE_ID_DE = env("IDEA_MENTION_TEMPLATE_ID_DE")
JOINED_IDEA_TEMPLATE = env("JOINED_IDEA_TEMPLATE")
JOINED_IDEA_TEMPLATE_DE = env("JOINED_IDEA_TEMPLATE_DE")
PROJECT_JOIN_REQUEST_TEMPLATE_ID = env("PROJECT_JOIN_REQUEST_TEMPLATE_ID")
PROJECT_JOIN_REQUEST_TEMPLATE_ID_DE = env("PROJECT_JOIN_REQUEST_TEMPLATE_ID_DE")
ORGANIZATION_FOLLOWER_TEMPLATE_ID = env("ORGANIZATION_FOLLOWER_TEMPLATE_ID")
ORGANIZATION_FOLLOWER_TEMPLATE_ID_DE = env("ORGANIZATION_FOLLOWER_TEMPLATE_ID_DE")
ORG_PUBLISHED_NEW_PROJECT_TEMPLATE_ID = env("ORG_PUBLISHED_NEW_PROJECT_TEMPLATE_ID")
ORG_PUBLISHED_NEW_PROJECT_TEMPLATE_ID_DE = env(
    "ORG_PUBLISHED_NEW_PROJECT_TEMPLATE_ID_DE"
)

FRONTEND_URL = env("FRONTEND_URL", "")
LOCATION_SERVICE_BASE_URL = env("LOCATION_SERVICE_BASE_URL")
ENABLE_LEGACY_LOCATION_FORMAT = env("ENABLE_LEGACY_LOCATION_FORMAT")
DEEPL_API_KEY = env("DEEPL_API_KEY")

ASGI_APPLICATION = "climateconnect_main.routing.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                {
                    "address": (env("REDIS_HOST"), env("REDIS_PORT", 6379)),
                    "password": env("REDIS_PASSWORD"),
                    "ssl": True,
                }
            ]
        },
    }
}

# For Celery we use Redis as a broker URL
CELERY_BROKER_URL = env("CELERY_BROKER_URL")

if env("ENVIRONMENT") == "production":
    CELERY_BROKER_USE_SSL = {"ssl_cert_reqs": ssl.CERT_REQUIRED}
CELERY_TIMEZONE = "UTC"
LOCALES = ["en", "de"]

LOCALE_PATHS = [
    BASE_DIR + "/translations",
]


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "fromatters": {"Simple_Format": "{levelname} {message}", "style": "{"},
    "handlers": {"console": {"level": "INFO", "class": "logging.StreamHandler"}},
    "loggers": {"django": {"handlers": ["console"], "level": "INFO"}},
}

# Setting up cache
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env("REDIS_URL"),
        "OPTIONS": {"PASSWORD": env("REDIS_PASSWORD")},
    }
}

DEFAULT_CACHE_TIMEOUT = 2 * 24 * 3600

USER_CHUNK_SIZE = env("USER_CHUNK_SIZE", 100)

# SENTRY setup
SENTRY_DSN = env("SENTRY_DSN")
SENTRY_ENVIRONMENT = env("SENTRY_ENVIRONMENT")

sentry_sdk.init(
    dsn=SENTRY_DSN,
    integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production,
    traces_sample_rate=1.0,
    # If you wish to associate users to errors (assuming you are using
    # django.contrib.auth) you may enable sending PII data.
    send_default_pii=True,
    # By default the SDK will try to use the SENTRY_RELEASE
    # environment variable, or infer a git commit
    # SHA as release, however you may want to set
    # something more human-readable.
    # release="myapp@1.0.0",
    # SENTRY ENVIRONMENT for local env is "development"
    # and for prod env is "production"
    environment=SENTRY_ENVIRONMENT,
)

CLIMATE_CONNECT_CONTACT_EMAIL = env(
    "CLIMATE_CONNECT_CONTACT_EMAIL", "contact@climateconnect.earth"
)
