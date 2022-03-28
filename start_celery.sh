# Enter virtual env
source pythonenv3/bin/activate

apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq

# go to backend folder
cd backend

# Install requirements
pip install -r requirements.txt

# starting celery worker and celery beat together.
celery -A climateconnect_main worker -B -l INFO 