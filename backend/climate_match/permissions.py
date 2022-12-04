from rest_framework.permissions import BasePermission
from climateconnect_api.models import UserProfile


class UserResourceMatchPermission(BasePermission):
    def has_permission(self, request, view):
        try:
            user_profile = UserProfile.objects.get(url_slug=view.kwargs.get("url_slug"))
        except UserProfile.DoesNotExist:
            return False

        if user_profile.user != request.user:
            return False

        return True
