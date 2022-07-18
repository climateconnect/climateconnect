# Enter virtual env
source pythonenv3/bin/activate

apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq

# go to backend folder
cd backend

# Install requirements
pip install -r requirements.txt

# starting celery worker
gunicorn --bind=0.0.0.0 --timeout 600 climateconnect_main.asgi:application & celery -A climateconnect_main worker -l INFO
