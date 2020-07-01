from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from climateconnect_api.permissions import UserPermission
from climateconnect_api.serializers.user import UserAccountSettingsSerializer


class UserAccountSettingsView(APIView):
    permission_classes = [UserPermission]

    def get(self, request):
        user = request.user
        serializer = UserAccountSettingsSerializer(user.user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        # set and confirm password.
        if 'password' in request.data and 'confirm_password' in request.data \
                and 'old_password' in request.data:
            check_existing_password = user.check_password(request.data['old_password'])
            if check_existing_password:
                if request.data['password'] == request.data['confirm_password']:
                    user.set_password(request.data['password'])
                else:
                    raise ValidationError('Password do not match.')
            else:
                raise ValidationError('Please enter correct password or click I forgot my password.')

        if 'email' in request.data:
            user.email = request.data['email']

        if 'email_updates_on_projects' in request.data and 'email_project_suggestions' in request.data:
            user.user_profile.email_updates_on_projects = request.data['email_updates_on_projects']
            user.user_profile.email_project_suggestions = request.data['email_project_suggestions']

        user.save()

        return Response({'message': 'Account successfully updated'}, status=status.HTTP_200_OK)
