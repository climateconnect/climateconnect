from location.models import Location
from location.serializers import LocationSerializer
from django.utils.translation import get_language
from hubs.utility.hub import get_hub_attribute, get_hub_stat_attribute
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from hubs.models import Hub, HubStat


class HubSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()
    hub_type = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    headline = serializers.SerializerMethodField()
    sub_headline = serializers.SerializerMethodField()
    segway_text = serializers.SerializerMethodField()
    image_attribution = serializers.SerializerMethodField()
    quick_info = serializers.SerializerMethodField()
    stat_box_title = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = Hub
        fields = (
            "name", 
            "headline", 
            "image",
            "quick_info",
            "stats",
            "sub_headline",
            "segway_text",
            "stat_box_title",
            "image_attribution",
            'hub_type',
            'location',
            'url_slug'
        )
    
    def get_stats(self, obj):
        return HubStatSerializer(obj.stats, many=True).data
    
    def get_hub_type(self, obj):
        return Hub.HUB_TYPES[obj.hub_type][1]

    def get_sub_headline(self, obj):
        return get_hub_attribute(obj, "sub_headline", get_language())
    
    def get_segway_text(self, obj):
        return get_hub_attribute(obj, "segway_text", get_language())
    
    def get_image_attribution(self, obj):
        return get_hub_attribute(obj, "image_attribution", get_language())
    
    def get_name(self, obj):
        return get_hub_attribute(obj, "name", get_language())
    
    def get_headline(self, obj):
        return get_hub_attribute(obj, "headline", get_language())
    
    def get_quick_info(self, obj):
        return get_hub_attribute(obj, "quick_info", get_language())
    
    def get_stat_box_title(self, obj):
        return get_hub_attribute(obj, "stat_box_title", get_language())

    def get_location(self, obj):
        if obj.location:
            return LocationSerializer(obj.location.all(), many=True).data
        return None

class HubStubSerializer(serializers.ModelSerializer):
    hub_type = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    quick_info = serializers.SerializerMethodField()
    class Meta:
        model = Hub
        fields = (
            "name",  
            "thumbnail_image",
            "quick_info",
            "url_slug",
            "hub_type",
            "icon"
        )

    def get_hub_type(self, obj):
        return Hub.HUB_TYPES[obj.hub_type][1]

    def get_name(self, obj):
        return get_hub_attribute(obj, "name", get_language())

    def get_quick_info(self, obj):
        return get_hub_attribute(obj, "quick_info", get_language())

class HubClimateMatchSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Hub
        fields = (
            "name",
            "id",
            "url_slug"
        )

    def get_name(self, obj):
        return get_hub_attribute(obj, "name", get_language())

class HubStatSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()
    value_description = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    source_name = serializers.SerializerMethodField()
    class Meta:
        model = HubStat
        fields = (
            "name",
            "value",
            "value_description",
            "description",
            "source_name",
            "source_link"
        )
    def get_name(self, obj):
        return get_hub_stat_attribute(obj, "name", get_language())

    def get_value(self, obj):
        return get_hub_stat_attribute(obj, "value", get_language())

    def get_value_description(self, obj):
        return get_hub_stat_attribute(obj, "value_description", get_language())

    def get_description(self, obj):
        return get_hub_stat_attribute(obj, "description", get_language())

    def get_source_name(self, obj):
        return get_hub_stat_attribute(obj, "source_name", get_language())