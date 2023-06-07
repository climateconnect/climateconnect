from rest_framework import serializers

from ideas.models import IdeaRating
from ideas.serializers.idea import IdeaMinimalSerializer


class IdeaRatingSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    idea = IdeaMinimalSerializer()

    class Meta:
        model = IdeaRating
        fields = ("id", "idea", "rating", "user")

    def get_user(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
