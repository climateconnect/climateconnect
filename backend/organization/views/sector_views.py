# from rest_framework.views import ListApiView
from rest_framework.generics import ListAPIView

from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from organization.serializers.sector import SectorSerializer
from organization.models import Sector


class ListSectors(ListAPIView):
    """
    List all sectors.
    """

    permission_classes = [AllowAny]
    serializer_class = SectorSerializer
<<<<<<< HEAD
    queryset = Sector.objects.all()

    def get(self, request, *args, **kwargs):
        """
        Get all sectors.
        """
        sectors = self.get_queryset()
        serializer = self.get_serializer(sectors, many=True)
        return Response(serializer.data)
=======

    def get_queryset(self):
        """
        Get all sectors.
        """
        return Sector.objects.all()
>>>>>>> master
