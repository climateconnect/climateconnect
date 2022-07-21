from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.user import UserProfileStubSerializer
from rest_framework import serializers
from climateconnect_api.models.content_shares import ContentShares


class ContentSharesSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = ContentShares
        fields = ("user_profile", "created_at", "shared_via")

    def get_user_profile(self, obj):
        user_profile = UserProfile.objects.get(user=obj.user)
        serializer = UserProfileStubSerializer(user_profile)
        return serializer.data
