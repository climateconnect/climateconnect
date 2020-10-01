from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from chat_messages.consumer import DirectMessageConsumer
from climateconnect_main.token_auth import TokenAuthMiddlewareStack

application = ProtocolTypeRouter({
    "websocket": TokenAuthMiddlewareStack(URLRouter([
        path("ws/chat/", DirectMessageConsumer, name='chat-messaging')
    ]))
})
