from rest_framework.generics import ListAPIView
from hubs.serializers.hub import HubSerializer, HubStubSerializer
from hubs.models.hub import Hub
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
            return Response({'message': 'Hub not found: {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)
        serializer = HubSerializer(hub, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ListHubsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HubStubSerializer

    def get_queryset(self):
        return Hub.objects.all().filter(importance__gte=1)