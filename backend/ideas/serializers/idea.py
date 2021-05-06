from rest_framework import serializers

from ideas.models import Idea


class IdeaMinimalSerializer(serializers.ModelSerializer):
    hub_image = serializers.SerializerMethodField()
    ratings = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'name', 'summary', 'thumbnail_image', 'hub_image'
        ]

    def get_hub_image(self, obj):
        return obj.hub.thumbnail_image
    
    def get_ratings(self, obj):
        return sum(
            idea_rating.rating for idea_rating in obj.rating_idea.objects.all()
        )
