from rest_framework import serializers
from chat_messages.models.message import Message
from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.user import UserProfileStubSerializer

from climateconnect_api.models import (
    Notification, UserNotification
)
from chat_messages.serializers.message import MessageSerializer

class NotificationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    chat_uuid = serializers.SerializerMethodField()
    chat_title = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            'notification_type',
            'text',
            'last_message',
            'chat_uuid',
            'chat_title'
        )
    
    def get_last_message(self, obj):
        message_participant = obj.chat
        if obj.chat:
            last_message = Message.objects.filter(message_participant=message_participant).first()
            serializer = MessageSerializer(last_message, many=False, context=self.context)
            return serializer.data
        else:
            return None
    
    def get_chat_uuid(self, obj):
        if obj.chat:
            return obj.chat.chat_uuid
        else:
            return None

    def get_chat_title(self, obj):
        if obj.chat:
            return obj.chat.name
        else:
            return None