from rest_framework import serializers
from chat_messages.models import Message, MessageParticipants, MessageReceiver
from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.user import UserProfileStubSerializer
from django.utils import timezone

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    read_at = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'content', 'sent_at', 'read_at', 'updated_at', 'sender')

    def get_sender(self, obj):
        user_profile = UserProfile.objects.filter(user=obj.sender)[0]
        return UserProfileStubSerializer(user_profile).data

    def get_read_at(self, obj):
        user = self.context.get('request', None).user
        if user == obj.sender:
            return timezone.now()
        else:
            receiver_object = MessageReceiver.objects.filter(receiver=user, message=obj)
            if receiver_object.exists():
                return receiver_object[0].read_at


class MessageParticipantSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = MessageParticipants
        # Could use user profile serializer for participant_one and participant_two
        fields = (
            'chat_uuid', 'participants', 'is_active', 'last_message', 
            'unread_count', 'user', 'created_at', 'name'
        )

    def get_last_message(self, obj):
        last_message = Message.objects.filter(message_participant=obj).first()
        if last_message:
            return {
                'content': last_message.content,
                'sent_at': last_message.sent_at
            }
        else:
            return None

    def get_participants(self, obj):
        user_profiles = UserProfile.objects.filter(user__in=obj.participants.all())
        return UserProfileStubSerializer(user_profiles, many=True).data

    def get_unread_count(self, obj):
        user = self.context.get('request', None).user
        unread_receivers = MessageReceiver.objects.filter(receiver=user, read_at=None).values('message')
        unread_messages = Message.objects.filter(id__in=[(obj['message']) for obj in unread_receivers], message_participant=obj).count()
        return unread_messages
    
    def get_user(self, obj):
        user = self.context.get('request', None).user
        user_profile = UserProfile.objects.filter(user=user)[0]
        return UserProfileStubSerializer(user_profile).data
