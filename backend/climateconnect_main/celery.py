import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'climateconnect_main.settings')

app = Celery('climateconnect_main')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# add weekly scheduling
app.conf.beat_schedule = {
    'schedule_weekly_local_recommendations_email': {
        'task': 'climateconnect_api.tasks.schedule_weekly_local_recommendations_email',
        'schedule': crontab(day_of_week=5, hour=11, minute=11)
    }, 
    'schedule_weekly_international_recommendations_email': {
        'task': 'climateconnect_api.tasks.schedule_weekly_international_recommendations_email',
        'schedule': crontab(day_of_week=5, hour=11, minute=11)
    }
}