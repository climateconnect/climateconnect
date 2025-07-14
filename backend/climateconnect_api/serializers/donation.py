from django.utils.translation import get_language
from organization.utility.donationgoal import get_donationgoal_name, get_donationgoal_call_to_action_text
from rest_framework import serializers
from climateconnect_api.models import DonationGoal
from hubs.serializers.hub import HubStubSerializer

class DonationGoalSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    hub = serializers.SerializerMethodField()
    call_to_action_text = serializers.SerializerMethodField()

    class Meta:
        model = DonationGoal
        fields = (
            "name", 
            "start_date", 
            "end_date", 
            "current_amount", 
            "goal_amount", 
            "hub", "unit", 
            "call_to_action_text", 
            "call_to_action_link"
        )

    def get_name(self, obj):
        return get_donationgoal_name(obj, get_language())
    
    def get_hub(self, obj):
        serializer = HubStubSerializer(obj.hub)
        return serializer.data
    
    def get_call_to_action_text(self, obj):
        return get_donationgoal_call_to_action_text(obj, get_language())
