from django.urls import path

from chat_messages.views.message_views import ConnectMessageParticipantsView

app_name = 'chat_messages'
urlpatterns = [
    path(
        'connect_participants/',
        ConnectMessageParticipantsView.as_view(), name='connect-participants-api'
    ),
]
