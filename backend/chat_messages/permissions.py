from rest_framework.permissions import BasePermission, SAFE_METHODS
from chat_messages.models import MessageParticipants, Participant
from climateconnect_api.models import Role


class ParticipantReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        try:
            chat = MessageParticipants.objects.get(
                chat_uuid=str(view.kwargs.get("chat_uuid"))
            )
        except MessageParticipants.DoesNotExist:
            return False

        try:
            requesting_participant = Participant.objects.filter(
                user=request.user, chat=chat, is_active=True
            )
            participant_to_update = Participant.objects.filter(
                id=int(view.kwargs.get("pk")), chat=chat
            )
        except Participant.DoesNotExist:
            return False

        if request.method in SAFE_METHODS:
            return True
        if requesting_participant.exists() and participant_to_update.exists():
            if requesting_participant[0].id == participant_to_update[0].id:
                if (
                    requesting_participant[0].role.role_type == Role.ALL_TYPE
                    and not requesting_participant[0].role.role_type
                    == participant_to_update[0].role.role_type
                ):
                    return False
                else:
                    return True
            if (
                requesting_participant[0].role.role_type
                > participant_to_update[0].role.role_type
            ):
                return True
        return False


class AddParticipantsPermission(BasePermission):
    def has_permission(self, request, view):
        try:
            chat = MessageParticipants.objects.get(
                chat_uuid=str(view.kwargs.get("chat_uuid"))
            )
        except MessageParticipants.DoesNotExist:
            return False

        try:
            requesting_participant = Participant.objects.filter(
                user=request.user, chat=chat, is_active=True
            )
        except Participant.DoesNotExist:
            return False

        if request.method in SAFE_METHODS:
            return True

        if "chat_participants" in request.data:
            for participant in request.data["chat_participants"]:
                if "permission_type_id" not in participant:
                    return False
                try:
                    new_participant_role = Role.objects.filter(
                        id=int(participant["permission_type_id"])
                    )[0]
                except Role.DoesNotExist:
                    return False
                if (
                    new_participant_role.role_type
                    >= requesting_participant[0].role.role_type
                ):
                    return False
        return True


class ChangeChatCreatorPermission(BasePermission):
    def has_permission(self, request, view):
        try:
            chat = MessageParticipants.objects.get(
                chat_uuid=str(view.kwargs.get("chat_uuid"))
            )
        except MessageParticipants.DoesNotExist:
            return False

        try:
            requesting_member = Participant.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE],
                chat=chat,
                is_active=True,
            )
        except Participant.DoesNotExist:
            return False

        if request.method in SAFE_METHODS:
            return True

        if requesting_member:
            return True

        return False
