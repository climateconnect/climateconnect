from rest_framework import serializers
from chat_messages.models import Message, MessageParticipants


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('content', 'sent_at', 'read_at', 'updated_at')


class MessageParticipantSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = MessageParticipants
        # Could use user profile serializer for participant_one and participant_two
        fields = ('chat_uuid', 'participant_one', 'participant_two', 'is_active')

    def get_last_message(self, obj):
        last_message = Message.objects.filter(message_pariticipant=obj).last()

        return {
            'content': last_message.content,
            'sent_at': last_message.sent_at
        }
