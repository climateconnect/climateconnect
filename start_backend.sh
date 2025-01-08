
# Install spatial dependencies
apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq

# Install pdm
curl -sSL https://raw.githubusercontent.com/pdm-project/pdm/main/install-pdm.py | python3 - --version 2.22.1
#post install for pdm
export PATH=/root/.local/bin:$PATH

# Go to backend folder
cd backend

# install dependencies
pdm install

# activate venv
$(pdm venv activate)

# Start server
gunicorn --preload --bind=0.0.0.0 climateconnect_main.asgi:application -w 4 -k uvicorn.workers.UvicornWorker & celery -A climateconnect_main worker -B -l INFO
