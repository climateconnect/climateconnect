import json
from channels.generic.websocket import AsyncWebsocketConsumer


class DirectMessageConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = 'direct_{}'.format(self.room_name)
        self.room_name = self.scope['url_route']['kwargs']['room_name']

    async def connect(self):
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
