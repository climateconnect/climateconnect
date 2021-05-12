from django.urls import path

from ideas.views.idea_views import (
    IdeasBoardView, IdeaView
)

app_name = 'ideas'
urlpatterns = [
    path('ideas/', IdeasBoardView.as_view(), name="ideasboard-view"),
    path('ideas/<str:url_slug>/', IdeaView.as_view(), name="idea-view")
]