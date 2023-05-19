from ideas.serializers.idea import IdeaMinimalSerializer
from climateconnect_api.serializers.role import RoleSerializer
from rest_framework import serializers
from ideas.models import Idea
from chat_messages.models import (
    Message,
    MessageParticipants,
    MessageReceiver,
    Participant,
)
from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.user import UserProfileStubSerializer
from django.utils import timezone


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    read_at = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "content", "sent_at", "read_at", "updated_at", "sender")

    def get_sender(self, obj):
        user_profile = UserProfile.objects.filter(user=obj.sender)[0]
        return UserProfileStubSerializer(user_profile).data

    def get_read_at(self, obj):
        request = self.context.get("request", None)
        user = None
        if request:
            user = request.user
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
    related_idea = serializers.SerializerMethodField()

    class Meta:
        model = MessageParticipants
        # Could use user profile serializer for participant_one and participant_two
        fields = (
            "id",
            "chat_uuid",
            "participants",
            "is_active",
            "last_message",
            "unread_count",
            "user",
            "created_at",
            "name",
            "related_idea",
        )

    def get_last_message(self, obj):
        last_message = Message.objects.filter(message_participant=obj).first()
        if last_message:
            return {"content": last_message.content, "sent_at": last_message.sent_at}
        else:
            return None

    def get_participants(self, obj):
        participants = Participant.objects.filter(chat=obj, is_active=True)
        return ParticipantSerializer(participants, many=True).data

    def get_unread_count(self, obj):
        user = self.context.get("request", None).user
        unread_receivers = MessageReceiver.objects.filter(
            receiver=user, read_at=None
        ).values("message")
        unread_messages = Message.objects.filter(
            id__in=[(obj["message"]) for obj in unread_receivers],
            message_participant=obj,
        ).count()
        return unread_messages

    def get_user(self, obj):
        user = self.context.get("request", None).user
        user_profile = UserProfile.objects.filter(user=user)[0]
        return UserProfileStubSerializer(user_profile).data

    def get_related_idea(self, obj):
        if obj.related_idea:
            try:
                idea = Idea.objects.get(id=obj.related_idea.id)
                return IdeaMinimalSerializer(idea, many=False).data
            except Idea.DoesNotExist:
                return None
        else:
            return None


class ParticipantSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    participant_id = serializers.SerializerMethodField()

    class Meta:
        model = Participant
        # Could use user profile serializer for participant_one and participant_two
        fields = ("participant_id", "user_profile", "role", "created_at")

    def get_user_profile(self, obj):
        user_profile = UserProfile.objects.get(user=obj.user)
        return UserProfileStubSerializer(user_profile).data

    def get_role(self, obj):
        return RoleSerializer(obj.role).data

    def get_participant_id(self, obj):
        return obj.id


class UpdateParticipateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ("id", "chat", "user", "role")
