from climateconnect_main.celery import app

import logging

logger = logging.getLogger(__name__)


@app.task
def add(a, b):
    logger.info(f"testing.... {a+b}")
