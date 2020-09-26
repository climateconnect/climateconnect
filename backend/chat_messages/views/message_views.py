from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound

from uuid import uuid4

from django.contrib.auth.models import User
from django.db.models import Q
from chat_messages.models import MessageParticipants, Message
from chat_messages.serializers.message import (
    MessageSerializer, MessageParticipantSerializer
)
from chat_messages.pagination import ChatMessagePagination, ChatsPagination
from climateconnect_api.models import UserProfile
from chat_messages.permissions import IsPartOfChat
from chat_messages.utility.chat_setup import set_read


class ConnectMessageParticipantsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if 'profile_url_slug' not in request.data:
            return Response({
                'message': 'Required parameter is missing'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_profile = UserProfile.objects.get(
                url_slug=str(request.data['profile_url_slug'])
            )
        except User.DoesNotExist:
            return Response({
                'message': 'Participant not found'
            }, status=status.HTTP_404_NOT_FOUND)

        participant_user = user_profile.user
        if participant_user:
            if MessageParticipants.objects.filter(
                Q(participant_one=user) | Q(participant_one=participant_user),
                Q(participant_two=user) | Q(participant_two=participant_user)
            ).exists():
                message_participant = MessageParticipants.objects.filter(
                    Q(participant_one=user) | Q(participant_one=participant_user),
                    Q(participant_two=user) | Q(participant_two=participant_user)
                ).first()
                return Response({
                    'chat_uuid': message_participant.chat_uuid,
                    'profile_url': user_profile.url_slug
                }, status=status.HTTP_200_OK)
            else:
                message_participant = MessageParticipants.objects.create(
                    chat_uuid=str(uuid4()),
                    participant_one=user,
                    participant_two=participant_user
                )

                return Response({
                    'chat_uuid': message_participant.chat_uuid,
                    'profile_url': user_profile.url_slug
                }, status=status.HTTP_201_CREATED)


class ListParticipantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):
        try:
            profile = UserProfile.objects.get(url_slug=str(url_slug))
        except UserProfile.DoesNotExist:
            return Response({
                'message': "Profile not found."
            }, status=status.HTTP_404_NOT_FOUND)

        participants = MessageParticipants.objects.filter(
            Q(participant_one=profile.user) | Q(participant_two=profile.user)
        )
        serializer = MessageParticipantSerializer(participants, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

class getChatsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageParticipantSerializer
    pagination_class = ChatsPagination

    def get_queryset(self):
        chats = MessageParticipants.objects.filter(                
            Q(participant_one=self.request.user) | Q(participant_two=self.request.user)
        )
        if chats.exists():
            return chats
        else:
            return []



class GetChatMessages(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = ChatMessagePagination

    def get_queryset(self):
        if 'chat_uuid' not in self.request.query_params:
            return NotFound('Required parameter missing')

        chat_uuid = self.request.query_params.get('chat_uuid')
        user = self.request.user
        try:
            message_participant = MessageParticipants.objects.get(                
                Q(participant_one=user) | Q(participant_two=user),
                chat_uuid=chat_uuid, 
            )
        except MessageParticipants.DoesNotExist:
            raise NotFound('You are not a particicapt of this chat.')
        
        if message_participant:
            messages = Message.objects.filter(
                message_participant=message_participant
            )
            set_read(messages)
            return messages

class GetChatMessage(APIView):
    permission_classes = [IsPartOfChat]

    def get(self, request, id, format=None):
        try:
            message = Message.objects.get(id=id)
        except Message.DoesNotExist:
            raise NotFound('This message does not exist')
        serializer = MessageSerializer(message, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)