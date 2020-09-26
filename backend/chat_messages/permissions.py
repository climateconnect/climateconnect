from rest_framework.permissions import BasePermission
from chat_messages.models import MessageParticipants
from django.db.models import Q

class IsPartOfChat(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        if MessageParticipants.objects.filter(                
                Q(participant_one=request.user) | Q(participant_two=request.user)
        ).exists():
            return True

        return False