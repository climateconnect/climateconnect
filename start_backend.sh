
# Install spatial dependencies
apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq

# Install pdm
pip install pdm

# Go to backend folder
cd backend

# install dependencies
pdm install

# activate venv
$(pdm venv activate)

# Start server
gunicorn --preload --bind=0.0.0.0 climateconnect_main.asgi:application -w 4 -k uvicorn.workers.UvicornWorker & celery -A climateconnect_main worker -B -l INFO
