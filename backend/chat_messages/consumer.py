import json
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from chat_messages.models import Message, MessageParticipants, MessageReceiver
from django.contrib.auth.models import User
from chat_messages.utility.notification import create_chat_message_notification
from climateconnect_api.utility.notification import create_user_notification, create_email_notification


class DirectMessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_anonymous:
            await self.channel_layer.group_add(
                'user-'+str(self.user.id), self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        self.user = self.scope['user']
        await self.channel_layer.group_discard(
            'user-'+str(self.user.id),
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        chat_uuid = text_data_json['chat_uuid']
        self.user = self.scope['user']
        # Send message to room group
        message_object = await self.new_message(chat_uuid, self.user, message)
        for receiver in message_object['receivers']:
            await self.channel_layer.group_send(
                'user-'+str(receiver.id),
                {
                    'type': 'chat_message',
                    'message': message,
                    'chat_uuid': chat_uuid,
                    'message_id': message_object['message'].id
                }
            )

    async def new_message(self, chat_uuid, user, message_content):
        try:
            message_participant = MessageParticipants.objects.get(
                chat_uuid=chat_uuid
            )
        except MessageParticipants.DoesNotExist:
            message_participant = None
        receivers = message_participant.participants.all()
        message = Message.objects.create(
            content=message_content, sender=user,
            message_participant=message_participant,
            sent_at=timezone.now()
        ) 
        message_participant.last_message_at = timezone.now()
        message_participant.save()
        notification = create_chat_message_notification(message_participant)
        for receiver in receivers: 
            if not receiver.id == user.id:
                MessageReceiver.objects.create(
                    receiver=receiver,
                    message=message
                )
                create_email_notification(receiver, message_participant, message_content, user, notification)
                create_user_notification(receiver, notification)
        return {
            "message": message,
            "receivers": receivers
        }          

    # Receive message from room group
    async def chat_message(self, event):
        if not self.user.is_anonymous:
            message = event['message']
            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'message': message,
                'type': event['type'],
                'chat_uuid': event['chat_uuid'],
                'message_id': event['message_id']
            }))

    async def notification(self, event):
        if not self.user.is_anonymous:
            await self.send(text_data=json.dumps({
                'type': event['type']
            }))