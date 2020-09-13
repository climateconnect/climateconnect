from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound

from uuid import uuid4

from django.contrib.auth.models import User
from chat_messages.models import MessageParticipants, Message
from chat_messages.serializers.message import MessageSerializer
from chat_messages.pagination import ChatMessagePagination


class ConnectMessageParticipantsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if 'user_id' not in request.data:
            return Response({
                'message': 'Required parameter is missing'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            participant_user = User.objects.get(id=int(request.data['user_id']))
        except User.DoesNotExist:
            return Response({
                'message': 'Participant not found'
            }, status=status.HTTP_404_NOT_FOUND)

        if participant_user:
            participants = [user, participant_user]
            participant_profile_url = participant_user.user_profile.url_slug

            if MessageParticipants.objects.filter(participants__in=participants).exists():
                message_participant = MessageParticipants.objects.filter(
                    participants__in=participants
                ).first()
                return Response({
                    'chat_id': message_participant.chat_uuid,
                    'profile_url': participant_profile_url
                }, status=status.HTTP_200_OK)
            else:
                message_participants = MessageParticipants.objects.create(
                    chat_uuid=str(uuid4())
                )
                for user in participants:
                    message_participants.participants.add(user)

                message_participants.save()
                return Response({
                    'chat_id': message_participants.chat_uuid,
                    'profile_url': participant_profile_url
                }, status=status.HTTP_201_CREATED)


class GetChatMessages(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = ChatMessagePagination

    def get_queryset(self):
        user = self.request.user
        if 'chat_uuid' not in self.request.query_params:
            return Response({
                'message': 'Required parameter missing'
            }, status=status.HTTP_400_BAD_REQUEST)

        chat_uuid = self.request.query_params.get('chat_uuid')
        participant_user_id = self.request.query_params.get('user_id')
        try:
            participant_user = User.objects.get(id=int(participant_user_id))
        except User.DoesNotExist:
            raise NotFound('participants not found')

        if participant_user:
            participants = [user, participant_user]
            try:
                message_participant = MessageParticipants.objects.filter(
                    chat_uuid=chat_uuid, participants__in=participants
                )
            except MessageParticipants.DoesNotExist:
                raise NotFound('There are no participants.')

            if message_participant:
                messages = Message.objects.filter(
                    message_participant=message_participant
                )
                return messages
