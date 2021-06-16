from rest_framework.permissions import BasePermission, SAFE_METHODS

from ideas.models import Idea


class IdeaReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            idea = Idea.objects.get(url_slug=view.kwargs.get('url_slug'))
        except Idea.DoesNotExist:
            return False

        if idea.user == request.user:
            return True

        return False


class IdeaRatingPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        else:
            if request.user.is_authenticated:
                return True
        
        return False


class IdeaSupporterPermission(BasePermission):
    def has_permission(self, request, view):
        if request.methods in SAFE_METHODS:
            return True
        else:
            if request.user.is_authenticated:
                return True
        
        return False