from django.urls import path

from ideas.views.idea_views import (
    IdeasBoardView,
)

app_name = 'ideas'
urlpatterns = [
    path('ideas/', IdeasBoardView.as_view(), name="ideasboard-view")
]