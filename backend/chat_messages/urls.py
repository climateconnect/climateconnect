from django.urls import path

from chat_messages.views import message_views

app_name = 'chat_messages'
urlpatterns = [
    path(
        'connect_participants/',
        message_views.ConnectMessageParticipantsView.as_view(),
        name='connect-participants-api'
    ),
    path(
        'profiles/<str:url_slug>/participants/',
        message_views.ListParticipantsView.as_view(),
        name='get-message-participants-api'
    ),
    path(
        'chats/',
        message_views.GetChatsView.as_view(),
        name='get-chats-api'
    ),
    path(
        'messages/',
        message_views.GetChatMessages.as_view(),
        name='get-chat-messages-api'
    ),
    path(
        'message/<int:id>/',
        message_views.GetChatMessage.as_view(),
        name='get-chat-message-api'
    )
]
