import os
import sys

from django.apps import AppConfig

SKIP_WORKER_COMMANDS = frozenset(
    {
        "migrate",
        "makemigrations",
        "collectstatic",
        "test",
        "shell",
        "createsuperuser",
        "loaddata",
        "dumpdata",
        "compilemessages",
        "check",
        "dbshell",
    }
)


class LocationConfig(AppConfig):
    name = "location"
    default_auto_field = "django.db.models.BigAutoField"

    def ready(self):
        import location.signals  # noqa: F401

        if len(sys.argv) > 1 and sys.argv[1] in SKIP_WORKER_COMMANDS:
            return
        if "runserver" in sys.argv and os.environ.get("RUN_MAIN") != "true":
            return
        from location.queue import start_worker

        start_worker()
