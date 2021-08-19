from django.urls import path
from climate_match.views.question_answer_views import QuestionAnswerView, \
    UserQuestionAnswerView

app_name = 'climate_match'
urlpatterns = [
    path(
        'questions/', QuestionAnswerView.as_view(),
        name='question-answer-list'
    ),
    path(
        'members/<str:url_slug>/question_answers/', UserQuestionAnswerView.as_view(),
        name='user-question-answer-list'
    )
]