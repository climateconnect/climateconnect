import json
from location.utility import format_location, get_location
from django.conf import settings
import requests
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from location.models import Location
from location.serializers import LocationStubSerializer


class GetLocationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        required_params = ["osm_id", "osm_type", "osm_class"]
        for param in required_params:
            if param not in request.data:
                return Response(
                    {"message": "Required parameter missing: {}".format(param)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        osm_id = request.data["osm_id"]
        osm_type = request.data["osm_type"]
        osm_class = request.data["osm_class"]
        
        # Try to find existing location by osm_id and osm_type
        location = Location.objects.filter(osm_id=osm_id, osm_type=osm_type, osm_class=osm_class)
        if location.exists():
            serializer = LocationStubSerializer(location[0])
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            url_root = settings.LOCATION_SERVICE_BASE_URL + "/lookup?osm_ids="
            osm_id_param = osm_type[0].upper() + str(osm_id)
            params = "&format=json&addressdetails=1&polygon_geojson=1&accept-language=en-US,en;q=0.9&polygon_threshold=0.001"
            url = url_root + osm_id_param + params
            response = requests.get(url)
            location_object = json.loads(response.text)[0]
            location = get_location(format_location(location_object, False))
            serializer = LocationStubSerializer(location)
            return Response(serializer.data, status=status.HTTP_200_OK)
