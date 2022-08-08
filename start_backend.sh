#enter virtual environment
source pythonenv3.7/bin/activate

#install spatial dependencies
apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq

#go to backend folder
cd backend

#install python dependencies
pip install -r requirements.txt

#start server
NEW_RELIC_CONFIG_FILE=newrelic.ini NEW_RELIC_LICENSE_KEY=$NEW_RELIC_LICENSE_KEY NEW_RELIC_ENVIRONMENT=$NEW_RELIC_ENVIRONMENT newrelic-admin run-program gunicorn --bind=0.0.0.0 climateconnect_main.asgi:application -w 4 -k uvicorn.workers.UvicornWorker