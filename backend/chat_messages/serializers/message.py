from rest_framework import serializers
from chat_messages.models import Message, MessageParticipants
from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.user import UserProfileStubSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'content', 'sent_at', 'read_at', 'updated_at', 'sender')

    def get_sender(self, obj):
        user_profile = UserProfile.objects.filter(user=obj.sender)[0]
        return UserProfileStubSerializer(user_profile).data

class MessageParticipantSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    participant_one = serializers.SerializerMethodField()
    participant_two = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = MessageParticipants
        # Could use user profile serializer for participant_one and participant_two
        fields = ('chat_uuid', 'participant_one', 'participant_two', 
        'is_active', 'last_message', 'unread_count')

    def get_last_message(self, obj):
        last_message = Message.objects.filter(message_participant=obj).first()

        return {
            'content': last_message.content,
            'sent_at': last_message.sent_at
        }

    def get_participant_one(self, obj):
        user_profile = UserProfile.objects.filter(user=obj.participant_one)[0]
        return UserProfileStubSerializer(user_profile).data

    def get_participant_two(self, obj):
        user_profile = UserProfile.objects.filter(user=obj.participant_two)[0]
        return UserProfileStubSerializer(user_profile).data

    def get_unread_count(self, obj):
        request = self.context.get('request', None)
        return Message.objects.filter(message_participant=obj, sender = request.user, read_at=None).count()