# Enter virtual environment
source pythonenv3.8/bin/activate

# Install spatial dependencies
apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq

# Go to backend folder
cd backend

# Install python dependencies
pip install -r requirements.txt

# Start server
gunicorn --preload --bind=0.0.0.0 climateconnect_main.asgi:application -w 4 -k uvicorn.workers.UvicornWorker & celery -A climateconnect_main worker -B -l INFO