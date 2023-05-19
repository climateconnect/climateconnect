"""
ASGI entrypoint. Configures Django and then runs the application
defined in the ASGI_APPLICATION setting.
"""

import os
import django
from channels.routing import get_default_application  # type: ignore

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "climateconnect_main.settings")
django.setup()
application = get_default_application()
