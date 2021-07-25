from typing import Dict, List, Optional
from django.db import connection
from django.db.models import QuerySet
from django.contrib.auth.models import User

from climate_match.models import (
    Answer, AnswerMetaData, Question, UserQuestionAnswer
)
from organization.models import Organization, Project
from ideas.models import Idea
from hubs.models import Hub


def sort_user_resource_preferences(user: User) -> List:
    user_resource_preference = []
    with connection.cursor() as cursor:
        cursor.execute("select reference_model from sort_user_preferences(%s)", [user.id])
        rows = cursor.fetchall()
        for row in rows:
            user_resource_preference.append(row[0])

    return user_resource_preference


def sort_projects_for_user(user_answer_metadata: List) -> Optional[QuerySet]:
    projects = Project.objects.raw(
        'SELECT * FROM'
    )
