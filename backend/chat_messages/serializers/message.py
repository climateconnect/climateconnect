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
    unread_count = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()

    class Meta:
        model = MessageParticipants
        # Could use user profile serializer for participant_one and participant_two
        fields = (
            'chat_uuid', 'participants', 'is_active', 'last_message', 'unread_count'
        )

    def get_last_message(self, obj):
        last_message = Message.objects.filter(message_participant=obj).first()

        return {
            'content': last_message.content,
            'sent_at': last_message.sent_at
        }

    def get_participants(self, obj):
        user_profiles = UserProfile.objects.filter(user__in=obj.participants.all())
        return UserProfileStubSerializer(user_profiles, many=True).data

    def get_unread_count(self, obj):
        user = self.context.get('user', None)
        unread_messages_unfiltered = Message.objects.filter(message_participant=obj, read_at=None)
        unread_messages = Message.objects.filter(message_participant=obj, read_at=None).exclude(sender=user).count()
        return unread_messages
