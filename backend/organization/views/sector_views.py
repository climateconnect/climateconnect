# from rest_framework.views import ListApiView
from rest_framework.generics import ListAPIView

from rest_framework.permissions import AllowAny

from organization.serializers.sector import SectorSerializer
from organization.models import Sector
from django.utils.translation import get_language


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
        if language_code == "en":
            order_by_field = "name"
        else:
            order_by_field = f"name_{language_code}_translation"

        return Sector.objects.all().order_by(order_by_field)
