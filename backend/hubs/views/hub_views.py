from rest_framework.generics import ListAPIView
from hubs.serializers.hub import (
    HubAmbassadorSerializer,
    HubSerializer,
    HubStubSerializer,
    HubSupporterSerializer,
    HubThemeSerializer
)
from hubs.models.hub import Hub, HubAmbassador, HubSupporter, HubTheme
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


class HubAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, url_slug):
        try:
            hub = Hub.objects.get(url_slug=str(url_slug))
        except Hub.DoesNotExist:
            return Response(
                {"message": "Hub not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = HubSerializer(hub, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HubAmbassadorAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, url_slug):
        try:
            hub = Hub.objects.get(url_slug=str(url_slug))
        except Hub.DoesNotExist:
            return Response(
                {"message": "Hub not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )
        ambassador = HubAmbassador.objects.filter(hub=hub)
        if ambassador.exists():
            serializer = HubAmbassadorSerializer(ambassador[0], many=False)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(None, status=status.HTTP_404_NOT_FOUND)


class ListHubsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HubStubSerializer

    def get_queryset(self):
        return Hub.objects.filter(importance__gte=1).prefetch_related("language")


class ListSectorHubsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HubStubSerializer

    def get_queryset(self):
        return Hub.objects.filter(hub_type=Hub.SECTOR_HUB_TYPE).filter(
            importance__gte=1
        )
    
class HubSupporterAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, url_slug):
        try:
            hub = Hub.objects.get(url_slug=str(url_slug))
        except Hub.DoesNotExist:
            return Response(
                {"message": "Hub not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )
        supporter = HubSupporter.objects.filter(hub=hub, importance__gte=1)

        if supporter.exists():
            serializer = HubSupporterSerializer(supporter, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(None, status=status.HTTP_404_NOT_FOUND)

class HubThemeAPIView(APIView):
    def get(self, request, url_slug):
        try:
            hub = Hub.objects.get(url_slug=str(url_slug))
        except Hub.DoesNotExist:
            return Response(
                {"message": "Hub not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            hub_theme = HubTheme.objects.get(hub=hub)
        except HubTheme.DoesNotExist:
            return Response(
                {"message": "Hub theme not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )
          
        serializer = HubThemeSerializer(hub_theme)
        return Response(serializer.data, status=status.HTTP_200_OK)
        