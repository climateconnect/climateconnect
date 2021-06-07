from django.urls import path

from ideas.views.idea_views import (
    CreateIdeaView, GetHaveIJoinedIdeaView, IdeasBoardView, IdeaView, JoinIdeaChatView
)
from ideas.views.comment_views import (
    IdeaCommentsView,
    ListIdeaCommentsView,
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
    path('ideas/<str:url_slug>/comments/', ListIdeaCommentsView.as_view(), name="list-idea-comments-view"),
    path('ideas/<str:url_slug>/comment/', IdeaCommentsView.as_view(), name="idea-comments-view"),
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
    ),
    path('ideas/<str:url_slug>/join_chat/', JoinIdeaChatView.as_view(), name="join-idea-chat-view"),
    path('ideas/<str:url_slug>/have_i_joined/', GetHaveIJoinedIdeaView.as_view(), name="have-i-joined-idea-view")
]