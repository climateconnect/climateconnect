from climateconnect_api.models.badge import DonorBadge
from climateconnect_api.serializers.badge import BadgeSerializer
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class getDonorBadges(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        badges = DonorBadge.objects.filter(is_active=True)
        serializer = BadgeSerializer(badges, many=True)
        return Response(serializer.data)
