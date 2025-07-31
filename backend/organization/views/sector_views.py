# from rest_framework.views import ListApiView
from rest_framework.generics import ListAPIView

from rest_framework.permissions import AllowAny
from hubs.models import Hub

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
        # TODO: should sector hubs behave the same as regular hubs
        # e.g. when shareing a project from a sector hub, should only the sector(s)
        # of the current sector hub be shown?

        if "hub" in self.request.query_params:
            hub = Hub.objects.prefetch_related("sectors").get(
                url_slug=self.request.query_params["hub"]
            )
            specific_sectors = hub.sectors.all()
            if len(specific_sectors) > 0:
                return specific_sectors

        return Sector.objects.filter(default_sector=True)
