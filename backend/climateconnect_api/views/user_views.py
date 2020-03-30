from django.contrib.auth import (authenticate, login)
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from knox.views import LoginView as KnowLoginView


class LoginView(KnowLoginView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        if 'username' and 'password' not in request.data:
            message = "Must include 'username' and 'password'"
            return Response({'message': message}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=request.data['username'], password=request.data['password'])
        if user:
            login(request, user)
            return super(LoginView, self).post(request, format=None)
        else:
            return Response({
                'message': 'Invalid password or username.'
            }, status=status.HTTP_401_UNAUTHORIZED)
