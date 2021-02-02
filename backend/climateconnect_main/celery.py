import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'climateconnect_main.settings')

app = Celery('climateconnect_main')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
