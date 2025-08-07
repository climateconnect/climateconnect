from rest_framework.generics import ListAPIView

from rest_framework.permissions import AllowAny
from hubs.models import Hub

from organization.serializers.sector import SectorSerializer
from organization.models import Sector
from django.utils.translation import get_language
import logging

logger = logging.getLogger(__name__)


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
        language_code = get_language()
        order_by_field = (
            "name" if language_code == "en" else f"name_{language_code}_translation"
        )

        if "hub" in self.request.query_params:
            url_slug = self.request.query_params["hub"]

            try:
                hub = Hub.objects.prefetch_related("sectors").get(url_slug=url_slug)
            except Hub.DoesNotExist:
                self._hub_not_found = url_slug
                logger.warning(f"Hub not found: {url_slug}")
                return Sector.objects.none()

            specific_sectors = hub.sectors.all()
            if specific_sectors.exists():
                return specific_sectors.order_by(order_by_field)

        return Sector.objects.filter(default_sector=True).order_by(order_by_field)
