from rest_framework.permissions import BasePermission
from climateconnect_api.models import UserProfile


class UserPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_autenticated() and UserProfile.objects.filter(user=request.user).exists():
            return True
        else:
            return False
