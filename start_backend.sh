#enter virtual environment
source pythonenv3.8/bin/activate

#install spatial dependencies
apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq

#go to backend folder
cd backend

#install python dependencies
pip install -r requirements.txt

#start server
gunicorn --bind=0.0.0.0 climateconnect_main.asgi:application -w 4 -k uvicorn.workers.UvicornWorker & celery -A climateconnect_main worker -B -l INFO
