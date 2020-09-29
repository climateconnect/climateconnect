from rest_framework import serializers
from chat_messages.models.message import Message
from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.user import UserProfileStubSerializer

from climateconnect_api.models import (
    Notification, UserNotification
)

class NotificationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    chat_message_sender = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            'notification_type',
            'text',
            'last_message',
            'chat_message_sender'
        )
    
    def get_last_message(self, obj):
        message_participant = obj.chat
        return Message.objects.filter(message_participant=message_participant).first().content
    
    def get_chat_message_sender(self, obj):
        user_profile = UserProfile.objects.filter(user=obj.chat_message_sender)[0]
        return UserProfileStubSerializer(user_profile).data