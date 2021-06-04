from django.urls import path

from ideas.views.idea_views import (
    CreateIdeaView, IdeasBoardView, IdeaView
)
from ideas.views.comment_views import (
    IdeaCommentsView,
    UpdateDestroyIdeaCommentView
)
from ideas.views.idea_support_views import (
    GetPersonalIdeaRatingView,
    IdeaRatingView,
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
    ),
    path(
        'ideas/<str:url_slug>/ratings/', IdeaRatingView.as_view(),
        name='idea-rating-view'
    ),
    path(
        'ideas/<str:url_slug>/my_rating/', GetPersonalIdeaRatingView.as_view(),
        name='get-my-idea-rating-view'
    )
]