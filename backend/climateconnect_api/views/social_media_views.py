from climateconnect_api.models.social_media import SocialMediaChannel
from climateconnect_api.serializers.social_media import OrganizationSocialMediaChannelSerializer
from rest_framework.generics import (
    ListAPIView,
)
from rest_framework.permissions import AllowAny

class ListSocialMediaChannels(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = OrganizationSocialMediaChannelSerializer
    def get_queryset(self):
        return SocialMediaChannel.objects.all()
