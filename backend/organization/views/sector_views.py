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

    def get_queryset(self):
        """
        Get all sectors.
        """
        # accept the parent hub url >> look for the children
        return Sector.objects.all() # add importance > 0 or is a sector of a linked hubs (parent, children, siblings)
