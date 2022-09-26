import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "climateconnect_main.settings")

app = Celery("climateconnect_main")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "schedule_automated_email_reminder_for_notifications": {
        "task": "climateconnect_api.tasks.schedule_automated_reminder_for_user_notifications",
        "schedule": crontab(minute=0, hour=0),
    },
    "testing_task": {
        "task": "climateconnect_api.tasks.testing_task",
        "schedule": crontab(minute="*/1"),
    },
}
