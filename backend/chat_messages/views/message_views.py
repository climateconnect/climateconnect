from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound

from uuid import uuid4

from django.db.models import Count
from django.contrib.auth.models import User
from django.db.models import Q
from chat_messages.models import MessageParticipants, Message
from chat_messages.serializers.message import (
    MessageSerializer, MessageParticipantSerializer
)
from chat_messages.pagination import ChatMessagePagination, ChatsPagination
from climateconnect_api.models import UserProfile
from chat_messages.utility.chat_setup import set_read

# Connect members of a private 1-on-1 chat
class GetChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_uuid, format=None):
        try:
            chat_object = MessageParticipants.objects.filter(chat_uuid=chat_uuid)
        except MessageParticipants.DoesNotExist:
            return Response({
                'message': "Chat not found."
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = MessageParticipantSerializer(chat_object[0], context={'request': request})

        return Response(serializer.data, status=status.HTTP_200_OK)
        

class StartPrivateChat(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'profile_url_slug' not in request.data:
            return Response({
                'message': 'Required parameter is missing'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_profile = UserProfile.objects.get(url_slug=str(request.data['profile_url_slug']))
        except User.DoesNotExist:
            return Response({'message': 'Participant not found'}, status=status.HTTP_404_NOT_FOUND)

        chatting_partner_user = user_profile.user
        participants = [request.user, chatting_partner_user]
        
        chat_with_users = MessageParticipants.objects.annotate(num_participants=Count('participants')).filter(
            participants=participants[0], num_participants=2
        ).filter(participants=participants[1]).distinct()
        if chat_with_users.exists():
            private_chat = chat_with_users[0]
        else:
            private_chat = MessageParticipants.objects.create(
                chat_uuid=str(uuid4())
            )
            for participant in participants:
                private_chat.participants.add(participant)
        serializer = MessageParticipantSerializer(
            private_chat, context={'request': request}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

#connect members of a group chat
class StartGroupChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if 'participants' not in request.data or 'group_chat_name' not in request.data:
            return Response({
                'message': 'Required parameter is missing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        participants = User.objects.filter(id__in=request.data['participants'])

        if participants.count() != len(request.data['participants']):
            return Response({
                'message': 'Could not find all users!'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        message_participant = MessageParticipants.objects.create(
            chat_uuid=str(uuid4()),
            name=request.data['group_chat_name']
        )
        for participant in participants:
            message_participant.participants.add(participant)
        message_participant.participants.add(user)
        return Response({
            'chat_uuid': message_participant.chat_uuid
        })


class GetChatsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageParticipantSerializer
    pagination_class = ChatsPagination

    def get_queryset(self):
        chats = MessageParticipants.objects.filter(
            participants=self.request.user
        )
        if chats.exists():
            filtered_chats = chats
            for chat in chats:
                if not chat.name and not Message.objects.filter(message_participant=chat).exists() and chat.participants.count() == 2:
                    filtered_chats = filtered_chats.exclude(id=chat.id)
            return filtered_chats
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
                participants=user,
                chat_uuid=chat_uuid, 
            )
        except MessageParticipants.DoesNotExist:
            raise NotFound('You are not a participant of this chat.')
        if message_participant:
            messages = Message.objects.filter(
                message_participant=message_participant
            )
            if messages: 
                set_read(messages.exclude(sender=user), user, message_participant.participants.count()==2)
            return messages


class GetChatMessage(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id, format=None):
        try:
            message_queryset = Message.objects.filter(id=id)
            message = message_queryset[0]
        except Message.DoesNotExist:
            raise NotFound('This message does not exist')
        if not MessageParticipants.objects.filter(
            id=message.message_participant.id, participants=request.user
        ).exists():
            raise NotFound('You are not a participant of this chat.')
        if not message.sender == request.user:
            set_read(message_queryset, self.request.user, True)
        serializer = MessageSerializer(message, many=False, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)