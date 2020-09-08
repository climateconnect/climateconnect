from rest_framework import serializers
from chat_messages.models import Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('content', 'sent_at', 'read_at', 'updated_at')
