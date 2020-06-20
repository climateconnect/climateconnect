from rest_framework.generics import ListAPIView

from climateconnect_api.models.common import Availability

class ListAvailabilitiesView(ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = ProjectMemberSerializer