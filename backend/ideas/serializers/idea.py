from rest_framework import serializers

from ideas.models import Idea


class IdeaMinimalSerializer(serializers.ModelSerializer):
    hub_image = serializers.SerializerMethodField()
    ratings = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'name', 'url_slug', 'short_description', 
            'thumbnail_image', 'hub_image', 'ratings'
        ]

    def get_hub_image(self, obj):
        if not obj.hub:
            return None
        elif not obj.hub.logo:
            return None
        else:
            return obj.hub.logo
    
    def get_ratings(self, obj):
        total_average = 0
        if obj.rating_idea.count() > 0:
            total_average = sum(
                idea_rating.rating for idea_rating in obj.rating_idea.all()
            ) //  obj.rating_idea.count()

        return total_average
