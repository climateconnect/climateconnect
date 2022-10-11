from climateconnect_api.models.social_media import SocialMediaChannel, SocialMediaLink
from rest_framework import serializers


class OrganizationSocialMediaLinkSerializer(serializers.ModelSerializer):
    social_media_channel = serializers.SerializerMethodField()

    class Meta:
        model = SocialMediaLink
        fields = ("social_media_channel",)

    def get_social_media_channel(self, obj):
        serializer = OrganizationSocialMediaChannelSerializer(obj.social_media_channel)
        return serializer.data


class OrganizationSocialMediaChannelSerializer(serializers.ModelSerializer):
    social_media_name = serializers.SerializerMethodField()

    class Meta:
        model = SocialMediaChannel
        fields = ("id", "social_media_name")

    def get_social_media_name(self, obj):
        return obj.social_media_name
