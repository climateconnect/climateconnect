from rest_framework import serializers

from ideas.models import Idea


class IdeaMinimalSerializer(serializers.ModelSerializer):
    hub_image = serializers.SerializerMethodField()
    ratings = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'name', 'summary', 
            'thumbnail_image', 'hub_image', 'ratings'
        ]

    def get_hub_image(self, obj):
        if not obj.hub:
            return None
        elif not obj.hub.thumbnail_image:
            return None
        else:
            return obj.hub.thumbnail_image
    
    def get_ratings(self, obj):
        total_rating = sum(
            idea_rating.rating for idea_rating in obj.rating_idea.all()
        )

        return total_rating // obj.rating_idea.count()
