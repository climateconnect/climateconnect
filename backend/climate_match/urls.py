from django.urls import path
from climate_match.views.question_answer_views import (
    QuestionAnswerView,
    UserQuestionAnswersView,
)
from climate_match.views.user_match_views import UserResourcesMatchView

app_name = "climate_match"
urlpatterns = [
    path("questions/", QuestionAnswerView.as_view(), name="question-answer-list"),
    path(
        "climatematch_question_answers/",
        UserQuestionAnswersView.as_view(),
        name="user-question-answer-list",
    ),
    path(
        "climatematch_results/",
        UserResourcesMatchView.as_view(),
        name="climatematch-results",
    ),
]
