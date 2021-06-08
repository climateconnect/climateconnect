from climateconnect_api.models import language
from django.utils.translation import get_language
from hubs.serializers.hub import HubStubSerializer
from rest_framework import serializers

from climateconnect_main.utility.general import get_image_from_data_url
from climateconnect_api.serializers.user import UserProfileStubSerializer
from location.utility import get_location
from ideas.models import Idea, IdeaSupporter
from ideas.utility.idea import (
    get_idea_name, get_idea_short_description,
    idea_translations
)


class IdeaSupportedMinimalSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = IdeaSupporter
        fields = ['name']
    
    def get_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'


class IdeaMinimalSerializer(serializers.ModelSerializer):
    hub = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'name', 'url_slug', 'short_description', 
            'thumbnail_image', 'hub', 'rating', 'image', 'user',
            'location'
        ]
    
    def get_name(self, obj):
        return get_idea_name(obj, get_language())
    
    def get_short_description(self, obj):
        return get_idea_short_description(obj, get_language())

    def get_hub(self, obj):
        if obj.hub:
            return HubStubSerializer(obj.hub).data
        
        return None

    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name
    
    def get_rating(self, obj):
        total_average = 0
        number_of_ratings = obj.rating_idea.count()
        if number_of_ratings > 0:
            total_average = sum(
                idea_rating.rating for idea_rating in obj.rating_idea.all()
            ) //  obj.rating_idea.count()

        return {
            'number_of_ratings': number_of_ratings,
            'rating_score': total_average
        }
    
    def get_user(self, obj):
        if obj.user and obj.user.user_profile:
            return UserProfileStubSerializer(obj.user.user_profile).data
        
        return None
    
    def get_location(self, obj):
        if obj.location:
            return obj.location.name
        
        return None


class IdeaSerializer(serializers.ModelSerializer):
    supported_by_users = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    hub_image = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = (
            'id', 'name', 'hub_image', 'image', 'short_description',
            'supported_by_users', 'thumbnail_image',
            'user', 'url_slug'
        )

    def get_name(self, obj):
        return get_idea_name(obj, get_language())
    
    def get_short_description(self, obj):
        return get_idea_short_description(obj, get_language())

    def get_hub_image(self, obj):
        if obj.hub and obj.hub.icon:
            return obj.hub.icon
        
        return None

    def get_user(self, obj):
        thumbnail_image = obj.user.user_profile.thumbnail_image.url
        return {
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'image': None if not thumbnail_image else thumbnail_image
        }
    
    def get_supported_by_users(self, obj):
        return {
            'total': obj.supported_idea.count(),
            'users': IdeaSupportedMinimalSerializer(
                obj.supported_idea.all(), many=True
            ).data
        }
    
    def create(self, validated_data):
        return Idea(**validated_data)

    def update(self, instance, validated_data):
        name = validated_data.get('name')
        short_description = validated_data.get('short_description')
        image_url = validated_data.get('image', None)
        thumbnail_image_url = validated_data.get('thumbnail_image', None)
        loc = validated_data.get('loc', None)
        
        if name and instance.name != name:
            instance.name = name
        
        if short_description and instance.short_description != short_description:
            instance.short_description = short_description

        if image_url is not None:
            image = get_image_from_data_url(image_url)[0]
            instance.image = image
        
        if thumbnail_image_url:
            thumbnail_image = get_image_from_data_url(thumbnail_image_url)[0]
            instance.thumbnail_image = thumbnail_image

        if loc:
            instance.location = get_location(loc)

        instance.save()
        return instance
