from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError


class UserAccountSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        # set and confirm password.
        if 'password' in request.data and 'confirm_password' in request.data:
            if request.data['password'] == request.data['confirm_password']:
                user.set_password(request.data['password'])
                user.save()
            else:
                raise ValidationError('Password do not match.')

        return Response({'message': 'Account successfully updated'}, status=status.HTTP_200_OK)
