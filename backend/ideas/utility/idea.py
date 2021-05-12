from typing import Optional

from rest_framework.response import Response
from ideas.models import Idea

import logging
logger = logging.getLogger(__name__)


def verify_idea(url_slug: str) -> Optional[Idea]:
    try:
        idea = Idea.objects.get(url_slug=url_slug)
    except Idea.DoesNotExist:
        logger.error("Idea not found for {}".format(url_slug))
        idea = None
    
    return idea
