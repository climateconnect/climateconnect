# from rest_framework.views import ListApiView
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from organization.serializers.sector import SectorSerializer
from organization.models import Sector


class ListSectors(ListAPIView):
    """
    List all sectors.
    """

    permission_classes = [AllowAny]
    serializer_class = SectorSerializer
    queryset = Sector.objects.all()

    def get(self, request, *args, **kwargs):
        """
        Get all sectors.
        """
        sectors = self.get_queryset()
        serializer = self.get_serializer(sectors, many=True)
        return Response(serializer.data)
