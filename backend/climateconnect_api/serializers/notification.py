from climateconnect_api.utility.notification import (
    get_following_user,
    get_organization_info,
    get_project_info,
)
from organization.utility.email import linkify_mentions
from ideas.serializers.comment import IdeaCommentSerializer
from rest_framework import serializers
from chat_messages.models.message import Message, MessageParticipants
from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.user import UserProfileStubSerializer

from climateconnect_api.models import Notification
from chat_messages.serializers.message import MessageSerializer
from organization.serializers.content import ProjectCommentSerializer


class NotificationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    chat_uuid = serializers.SerializerMethodField()
    chat_title = serializers.SerializerMethodField()
    project_comment = serializers.SerializerMethodField()
    project_comment_parent = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    project_follower = serializers.SerializerMethodField()
    project_like = serializers.SerializerMethodField()
    idea = serializers.SerializerMethodField()
    idea_comment = serializers.SerializerMethodField()
    idea_comment_parent = serializers.SerializerMethodField()
    idea_supporter = serializers.SerializerMethodField()
    idea_supporter_chat = serializers.SerializerMethodField()
    membership_requester = serializers.SerializerMethodField()
    organization_follower = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            "id",
            "notification_type",
            "text",
            "last_message",
            "chat_uuid",
            "chat_title",
            "project_comment",
            "project_comment_parent",
            "project",
            "project_follower",
            "project_like",
            "idea",
            "idea_comment",
            "idea_comment_parent",
            "idea_supporter",
            "idea_supporter_chat",
            "membership_requester",
            "organization_follower",
            "organization",
        )

    def get_last_message(self, obj):
        message_participant = obj.chat
        if obj.chat:
            last_message = Message.objects.filter(
                message_participant=message_participant
            ).first()
            serializer = MessageSerializer(
                last_message, many=False, context=self.context
            )
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

    def get_project_comment(self, obj):
        if obj.project_comment:
            serializer = ProjectCommentSerializer(obj.project_comment)
            comment = serializer.data
            comment["content"] = linkify_mentions(comment["content"])
            return comment

    def get_project_comment_parent(self, obj):
        if obj.project_comment:
            serializer = ProjectCommentSerializer(obj.project_comment.parent_comment)
            comment = serializer.data
            comment["content"] = linkify_mentions(comment["content"])
            return comment

    def get_project(self, obj):
        if obj.project_comment:
            return get_project_info(obj.project_comment.project)

        if obj.project_follower:
            return get_project_info(obj.project_follower.project)

        if obj.project_like:
            return get_project_info(obj.project_like.project)

        if obj.membership_request and obj.membership_request.target_project is not None:
            return get_project_info(obj.membership_request.target_project)

        if obj.org_project_published:
            return get_project_info(obj.org_project_published.project)

    def get_organization(self, obj):
        if obj.org_project_published:
            return get_organization_info(obj.org_project_published.organization)

        if obj.organization_follower:
            return get_organization_info(obj.organization_follower.organization)

    def get_project_follower(self, obj):
        if obj.project_follower:
            return get_following_user(obj.project_follower.user)

    def get_organization_follower(self, obj):
        if obj.organization_follower:
            return get_following_user(obj.organization_follower.user)

    def get_project_like(self, obj):
        if obj.project_like:
            liking_user = UserProfile.objects.get(user=obj.project_like.user)
            serializer = UserProfileStubSerializer(liking_user)
            return serializer.data

    def get_idea(self, obj):
        if obj.idea_comment:
            return {
                "name": obj.idea_comment.idea.name,
                "url_slug": obj.idea_comment.idea.url_slug,
                "hub_url_slug": obj.idea_comment.idea.hub_shared_in.url_slug,
            }
        if obj.idea_supporter:
            return {
                "name": obj.idea_supporter.idea.name,
                "url_slug": obj.idea_supporter.idea.url_slug,
                "hub_url_slug": obj.idea_supporter.idea.hub_shared_in.url_slug,
            }

    def get_idea_comment(self, obj):
        if obj.idea_comment:
            serializer = IdeaCommentSerializer(obj.idea_comment)
            comment = serializer.data
            comment["content"] = linkify_mentions(comment["content"])
            return comment

    def get_idea_comment_parent(self, obj):
        if obj.idea_comment and obj.idea_comment.parent_comment:
            serializer = IdeaCommentSerializer(
                obj.idea_comment.parent_comment.ideacomment
            )
            return serializer.data

    def get_idea_supporter(self, obj):
        if obj.idea_supporter:
            supporter_user = UserProfile.objects.filter(user=obj.idea_supporter.user)
            serializer = UserProfileStubSerializer(supporter_user[0])
            return serializer.data

    def get_idea_supporter_chat(self, obj):
        if obj.idea_supporter:
            idea = obj.idea_supporter.idea
            chat = MessageParticipants.objects.get(related_idea=idea)
            return chat.chat_uuid

    def get_membership_requester(self, obj):
        if obj.membership_request:
            requester_user = UserProfile.objects.get(user=obj.membership_request.user)
            serializer = UserProfileStubSerializer(requester_user)
            return serializer.data
