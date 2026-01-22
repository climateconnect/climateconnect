from django.utils.translation import get_language
from climateconnect_api.utility.translation import translate_text
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from climateconnect_api.utility.search import cross_search


class CrossSearchView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        required_params = ["text"]
        for param in required_params:
            if param not in request.data:
                raise ValidationError("Required parameter missing: " + param)
        

        results = cross_search(input_text=request.data["text"])

        print(results)
        
        return Response({#"profiles": results["profiles"], 
                         "projects": results["projects"],
                         "organizations" : results["organizations"]
                        }
                        , status=status.HTTP_200_OK)
