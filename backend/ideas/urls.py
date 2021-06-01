from django.urls import path

from ideas.views.idea_views import (
    CreateIdeaView, IdeasBoardView, IdeaView
)
from ideas.views.comment_views import (
    IdeaCommentsView,
    UpdateDestroyIdeaCommentView
)

app_name = 'ideas'
urlpatterns = [
    path('ideas/', IdeasBoardView.as_view(), name="ideasboard-view"),
    path('ideas/<str:url_slug>/', IdeaView.as_view(), name="idea-view"),
    path('create_idea/', CreateIdeaView.as_view(), name="create-idea-view"),
    path('ideas/<str:url_slug>/comments/', IdeaCommentsView.as_view(), name="idea-comments-view"),
    path(
        'ideas/<str:url_slug>/comments/<int:comment_id>/',
        UpdateDestroyIdeaCommentView.as_view(), name='update-destroy-idea-comment-view'
    )
]