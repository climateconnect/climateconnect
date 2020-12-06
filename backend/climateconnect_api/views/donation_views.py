from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import datetime

from climateconnect_api.models import DonationGoal, Donation
from climateconnect_api.serializers.donation import DonationGoalSerializer

class GetDonationGoalProgress(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        now = datetime.datetime.now()
        try:
            goal = DonationGoal.objects.get(start_date__lte=now, end_date__gte=now)
        except DonationGoal.DoesNotExist:
            goal = None
        serializer = DonationGoalSerializer(goal, many=False)
        return Response(serializer.data)
