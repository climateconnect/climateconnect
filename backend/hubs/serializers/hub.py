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
            "segway_text"
        )
    
    def get_stats(self, obj):
        print(obj)
        return HubStatSerializer(obj.stats, many=True).data

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