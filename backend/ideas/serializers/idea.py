from rest_framework import serializers

from ideas.models import Idea


class IdeaMinimalSerializer(serializers.ModelSerializer):
    hub_image = serializers.SerializerMethodField()
    ratings = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'name', 'url_slug', 'short_description', 
            'thumbnail_image', 'hub_image', 'ratings', 'image'
        ]

    def get_hub_image(self, obj):
        if not obj.hub:
            return None
        elif not obj.hub.icon:
            return None
        else:
            return obj.hub.icon
    
    def get_ratings(self, obj):
        total_average = 0
        if obj.rating_idea.count() > 0:
            total_average = sum(
                idea_rating.rating for idea_rating in obj.rating_idea.all()
            ) //  obj.rating_idea.count()

        return total_average


class IdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = (
            'id', 'name', 'url_slug', 'short_description',
            'image', 'thumbnail_image'
        )
    
    def update(self, instance, validated_data):
        name = validated_data.get('name')
        short_description = validated_data.get('short_description')
        
        if name and instance.name != name:
            instance.name = name
            # update url_slug
            instance.url_slug = instance.name.replace(" ", "") + instance.id
        
        if short_description and instance.short_description != short_description:
            instance.short_description = short_description

        instance.save()
        return instance
