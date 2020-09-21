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
        'messages/',
        message_views.GetChatMessages.as_view(),
        name='get-chat-messages-apis'
    )
]
