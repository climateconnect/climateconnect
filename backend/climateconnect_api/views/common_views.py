from rest_framework.generics import ListAPIView

from climateconnect_api.models.common import Availability, Skill
from rest_framework.permissions import AllowAny
from climateconnect_api.serializers.common import AvailabilitySerializer, SkillSerializer
from climateconnect_api.pagination import SkillsPagination


class ListAvailabilitiesView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AvailabilitySerializer

    def get_queryset(self):
        return Availability.objects.all()


class ListSkillsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SkillSerializer
    pagination_class = SkillsPagination

    def get_queryset(self):
        return Skill.objects.all()
