from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from hubs.models import Hub, HubStat


class HubSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()
    hub_type = serializers.SerializerMethodField()

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
            'location'
        )
    
    def get_stats(self, obj):
        return HubStatSerializer(obj.stats, many=True).data
    
    def get_hub_type(self, obj):
        return Hub.HUB_TYPES[obj.hub_type][1]

class HubStubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hub
        fields = (
            "name",  
            "thumbnail_image",
            "quick_info",
            "url_slug",
        )

class HubStatSerializer(serializers.ModelSerializer):

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