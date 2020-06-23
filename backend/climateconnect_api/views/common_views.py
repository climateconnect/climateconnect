from rest_framework.generics import ListAPIView

from climateconnect_api.models.common import Availability
from rest_framework.permissions import AllowAny
from climateconnect_api.serializers.common import AvailabilitySerializer

class ListAvailabilitiesView(ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = AvailabilitySerializer
  queryset = Availability.objects.all()

