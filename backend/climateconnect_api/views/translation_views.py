from django.utils.translation import get_language
from climateconnect_api.utility.translation import translate_text
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError


class TranslateTextView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        required_params = ['text', 'target_language']
        for param in required_params:
            if param not in request.data:
                raise ValidationError('Required parameter mission: ' + param)
        translated_object = translate_text(request.data['text'], get_language(), request.data['target_language'])  
        return Response({'result': translated_object}, status=status.HTTP_200_OK)
