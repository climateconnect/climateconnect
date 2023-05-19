from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter # type: ignore
from chat_messages.consumer import DirectMessageConsumer
from climateconnect_main.token_auth import TokenAuthMiddlewareStack
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": TokenAuthMiddlewareStack(
            URLRouter([path("ws/chat/", DirectMessageConsumer, name="chat-messaging")])
        ),
    }
)
