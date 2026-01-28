FROM python:3.11-slim

# Install system dependencies for PostGIS and GDAL
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PDM
RUN pip install pdm

WORKDIR /app

# Copy dependency files
COPY backend/pyproject.toml backend/pdm.lock* ./

# Install dependencies to a location that won't be overwritten by volume mount
RUN pdm install --no-self && pdm run pip install gunicorn uvicorn

# Expose port
EXPOSE 8000

# Use a startup script that installs deps if needed and runs the server
CMD ["sh", "-c", "pdm install --no-self && pdm run python manage.py migrate && pdm run gunicorn --bind 0.0.0.0:8000 climateconnect_main.asgi:application -w 4 -k uvicorn.workers.UvicornWorker"]
