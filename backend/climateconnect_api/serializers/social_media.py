from climateconnect_api.models.social_media import SocialMediaChannel, SocialMediaLink
from rest_framework import serializers


class OrganizationSocialMediaLinkSerializer(serializers.ModelSerializer):
    social_media_channel = serializers.SerializerMethodField()
    handle = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = SocialMediaLink
        fields = ("social_media_channel", "handle", "url")

    def get_social_media_channel(self, obj):
        serializer = OrganizationSocialMediaChannelSerializer(obj.social_media_channel)
        return serializer.data

    def get_handle(self, obj):
        return obj.handle

    def get_url(self, obj):
        return obj.url


class OrganizationSocialMediaChannelSerializer(serializers.ModelSerializer):
    social_media_name = serializers.SerializerMethodField()
    ask_for_full_website = serializers.SerializerMethodField()
    base_url = serializers.SerializerMethodField()

    class Meta:
        model = SocialMediaChannel
        fields = ("id", "social_media_name", "ask_for_full_website", "base_url")

    def get_social_media_name(self, obj):
        return obj.social_media_name

    def get_ask_for_full_website(self, obj):
        return obj.ask_for_full_website

    def get_base_url(self, obj):
        return obj.base_url
