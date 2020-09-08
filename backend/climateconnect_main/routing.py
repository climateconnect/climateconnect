from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from chat_messages.consumer import DirectMessageConsumer

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(URLRouter([
        path("ws/chat/<str:room_name>/", DirectMessageConsumer, name='chat-messaging')
    ]))
})
