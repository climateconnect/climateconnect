#!/bin/bash

# Setup frontend env file
if [[ ! -f frontend/.env ]]; then
    cat >frontend/.env <<EOF
API_HOST="0.0.0.0"
API_URL="http://0.0.0.0:8000"
BASE_URL_HOST="0.0.0.0"
SOCKET_URL="ws://0.0.0.0"
ENVIRONMENT="development"
EOF
else
    echo frontend/.env already exists
fi

# Setup backend env file
SECRET_KEY="$(openssl rand -base64 32)"

if [[ ! -f backend/.backend_env ]]; then
    cat > backend/.backend_env <<EOF
FRONTEND_URL=http://0.0.0.0:3000
SECRET_KEY=$SECRET_KEY

ALLOWED_HOSTS=http://0.0.0.0:8000
ENVIRONMENT=development

MEDIA_ROOT=/workspaces/climateconnect/backend/media
DEBUG=True
AUTO_VERIFY=True
LOCATION_SERVICE_BASE_URL=...
ENABLE_LEGACY_LOCATION_FORMAT=True
CELERY_BROKER_URL="redis://redis"

DATABASE_NAME="climateconnect_db"
DATABASE_USER="admin"
DATABASE_PASSWORD="admin"
DATABASE_HOST=db
DATABASE_PORT=5432

REDIS_URL="redis://redis:6379/0"
EOF
else
    echo backend/.backend_env already exists
fi

cd backend
python manage.py migrate
python3 manage.py create_test_data --number_of_rows 4