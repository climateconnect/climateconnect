
from climateconnect_api.serializers.user import UserProfileStubSerializer
from django.utils.translation import get_language
from hubs.serializers.hub import HubStubSerializer
from ideas.models import Idea, IdeaSupporter
from ideas.utility.idea import get_idea_name, get_idea_short_description
from organization.serializers.organization import OrganizationStubSerializer
from rest_framework import serializers
import urllib.parse


class IdeaSupportedMinimalSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = IdeaSupporter
        fields = ['name']
    
    def get_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'

class IdeaFromIdeaSupporterSerializer(serializers.ModelSerializer):
    idea = serializers.SerializerMethodField()

    class Meta:
        model = IdeaSupporter
        fields = ('idea',)

    def get_idea(self, obj):
        serializer = IdeaMinimalSerializer(obj.idea)
        return serializer.data

class IdeaMinimalSerializer(serializers.ModelSerializer):
    hub = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()
    url_slug = serializers.SerializerMethodField()
    hub_shared_in = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'name', 'url_slug', 'short_description', 
            'thumbnail_image', 'hub', 'rating', 'image', 'user',
            'location', 'created_at', 'organization', 'hub_shared_in'
        ]
    
    def get_name(self, obj):
        return get_idea_name(obj, get_language())
    
    def get_short_description(self, obj):
        return get_idea_short_description(obj, get_language())

    def get_hub(self, obj):
        if obj.hub:
            return HubStubSerializer(obj.hub).data
        
        return None

    def get_hub_shared_in(self, obj):
        if obj.hub:
            return HubStubSerializer(obj.hub_shared_in).data
        
        return None
    
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

    def get_organization(self, obj):
        if obj.organization:
            return OrganizationStubSerializer(obj.organization).data
        
        return None

    def get_url_slug(self, obj):
        return obj.url_slug


class IdeaSerializer(serializers.ModelSerializer):
    supported_by_users = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    hub_image = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    url_slug = serializers.SerializerMethodField()

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

    def get_url_slug(self, obj):
        return obj.url_slug