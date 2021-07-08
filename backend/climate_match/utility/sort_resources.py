from typing import List, Optional
from django.db.models import QuerySet
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

from climate_match.models import (
    Answer, AnswerMetaData, Question, UserQuestionAnswer
)
from organization.models import Organization, Project
from ideas.models import Idea
from hubs.models import Hub


def sort_resources_for_user(user: User) -> Optional[QuerySet]:
    user_question_answers = UserQuestionAnswer.objects.filter(user=user)

    resources = []
    return resources


def sort_projects_for_user(user_answer_metadata: List) -> Optional[QuerySet]:
    projects = Project.objects.raw(
        'SELECT * FROM'
    )
