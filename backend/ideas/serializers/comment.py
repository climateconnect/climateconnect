from rest_framework import serializers

from ideas.serializers.idea import IdeaMinimalSerializer
from organization.serializers.content import CommentSerializer

import logging

logger = logging.getLogger(__name__)


class IdeaCommentSerializer(CommentSerializer):
    idea = serializers.SerializerMethodField()

    class Meta(CommentSerializer.Meta):
        fields = CommentSerializer.Meta.fields + ("idea",)  # type: ignore

    def get_idea(self, obj):
        return IdeaMinimalSerializer(obj.idea).data
