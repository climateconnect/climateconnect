from rest_framework import serializers
from hubs.models import Hub, HubStat


class HubSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()

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
            "stat_box_title"
        )
    
    def get_stats(self, obj):
        print(obj)
        return HubStatSerializer(obj.stats, many=True).data

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