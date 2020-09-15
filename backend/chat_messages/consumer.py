import json
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from chat_messages.models import Message, MessageParticipants
from django.contrib.auth.models import User


class DirectMessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        print(self.room_name)
        print(self.user)
        if not self.user.is_anonymous:
            await self.channel_layer.group_add(
                self.room_name, self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.user = self.scope['user']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    def new_message(self, chat_uuid, user, message_content):
        try:
            message_participant = MessageParticipants.objects.get(
                chat_uuid=chat_uuid
            )
        except MessageParticipants.DoesNotExist:
            message_participant = None

        if message_participant:
            Message.objects.create(
                content=message_content, sender=user,
                message_participant=message_participant,
                sent_at=timezone.now()
            )

    # Receive message from room group
    async def chat_message(self, event):
        if not self.user.is_anonymous:
            message = event['message']
            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'message': message
            }))
            self.new_message(event['chat_uuid'], self.user, message)
