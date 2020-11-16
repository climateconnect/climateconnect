from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound

from uuid import uuid4

from django.db.models import Count
from django.contrib.auth.models import User
from django.db.models import Q
from chat_messages.models import MessageParticipants, Message, Participant
from chat_messages.serializers.message import (
    MessageSerializer, MessageParticipantSerializer, UpdateParticipateSerializer
)
from chat_messages.pagination import ChatMessagePagination, ChatsPagination
from climateconnect_api.models import UserProfile, Role
from chat_messages.utility.chat_setup import set_read
from chat_messages.permissions import ChangeChatCreatorPermission, AddParticipantsPermission, ParticipantReadWritePermission
import logging
logger = logging.getLogger(__name__)

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

        chats_with_creator = Participant.objects.filter(user=request.user).values_list('chat', flat=True)
        chats_with_both_users = Participant.objects.filter(user=chatting_partner_user, chat__in=chats_with_creator).values_list('chat', flat=True)
        
        private_chat_with_both_users = MessageParticipants.objects.annotate(
            num_participants=Count('participant_participants')
        ).filter(
            id__in=chats_with_both_users, num_participants=2
        )
        if private_chat_with_both_users.exists():
            private_chat = private_chat_with_both_users[0]
        else:
            private_chat = MessageParticipants.objects.create(
                chat_uuid=str(uuid4())
            )
            basic_role = Role.objects.get(role_type=0)
            for participant in participants:
                Participant.objects.create(user=participant, chat=private_chat, role=basic_role)
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
        
        chat = MessageParticipants.objects.create(
            chat_uuid=str(uuid4()),
            name=request.data['group_chat_name']
        )
        creator_role = Role.objects.get(role_type=2)
        member_role = Role.objects.get(role_type=0)
        for participant in participants:
            Participant.objects.create(user=participant, chat=chat, role=member_role)
        Participant.objects.create(user=user, chat=chat, role=creator_role)
        return Response({
            'chat_uuid': chat.chat_uuid
        })


class GetChatsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageParticipantSerializer
    pagination_class = ChatsPagination

    def get_queryset(self):
        chat_ids = Participant.objects.filter(
            user=self.request.user
        ).values_list('chat', flat=True)
        chats = MessageParticipants.objects.filter(
            id__in=chat_ids
        )
        if chats.exists():
            filtered_chats = chats
            for chat in chats:
                number_of_participants = Participant.objects.filter(chat=chat).count()
                if not chat.name and not Message.objects.filter(message_participant=chat).exists() and number_of_participants == 2:
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
            chat = MessageParticipants.objects.get(           
                chat_uuid=chat_uuid
            )
            Participant.objects.get(user=user, chat=chat)
        except Participant.DoesNotExist:
            raise NotFound('You are not a participant of this chat.')
        if chat:
            messages = Message.objects.filter(
                message_participant=chat
            )
            if messages: 
                number_of_participants = Participant.objects.filter(chat=chat).count()
                set_read(messages.exclude(sender=user), user, number_of_participants==2)
            return messages


class GetChatMessage(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id, format=None):
        try:
            message_queryset = Message.objects.filter(id=id)
            message = message_queryset[0]
        except Message.DoesNotExist:
            raise NotFound('This message does not exist')
        try:
            chat = MessageParticipants.objects.get(           
                chat_uuid=message.message_participant.chat_uuid
            )
            Participant.objects.get(user=request.user, chat=chat)
        except Participant.DoesNotExist:
            raise NotFound('You are not a participant of this chat.')
        if not message.sender == request.user:
            set_read(message_queryset, self.request.user, True)
        serializer = MessageSerializer(message, many=False, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateChatMemberView(RetrieveUpdateDestroyAPIView):
    permission_classes = [ParticipantReadWritePermission]
    serializer_class = UpdateParticipateSerializer

    def get_queryset(self):
        chat = MessageParticipants.objects.get(chat_uuid=str(self.kwargs['chat_uuid']))
        return Participant.objects.filter(id=int(self.kwargs['pk']), chat=chat)

    def perform_destroy(self, instance):
        instance.delete()
        return "Chat member successfully deleted."

    def perform_update(self, serializer):
        print(serializer)
        serializer.save()
        return serializer.data

class AddChatMembersView(APIView):
    permission_classes = [AddParticipantsPermission]

    def post(self, request, chat_uuid):
        chat = MessageParticipants.objects.get(chat_uuid=chat_uuid)

        roles = Role.objects.all()
        if 'chat_participants' not in request.data:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)

        for member in request.data['chat_participants']:
            try:
                user = User.objects.get(id=int(member['id']))
            except User.DoesNotExist:
                logger.error("[AddChatMembersView] Passed user id {} does not exists".format(int(member['id'])))
                continue
            if 'permission_type_id' not in member:
                logger.error("[AddChatMembersView] No permissions passed for user id {}.".format(int(member['id'])))
                continue
            user_role = roles.filter(id=int(member['permission_type_id'])).first()
            if user:
                Participant.objects.create(
                    chat=chat, user=user, role=user_role
                )
                    
                logger.info("Participant object created for user {}".format(user.id))

        return Response({'message': 'Participants added to the chat'}, status=status.HTTP_201_CREATED)


class ChangeChatCreatorView(APIView):
    permission_classes = [ChangeChatCreatorPermission]

    def post(self, request, chat_uuid):
        if 'user' not in request.data:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            new_creator_user = User.objects.get(id=int(request.data['user']))
        except User.DoesNotExist:
            raise NotFound(detail="Profile not found.", code=status.HTTP_404_NOT_FOUND)   
        if request.user.id == new_creator_user.id:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)

        chat = MessageParticipants.objects.get(chat_uuid=chat_uuid)
        roles = Role.objects.all()     
        if Participant.objects.filter(user=new_creator_user, chat = chat).exists():
            # update old creator profile and new creator profile
            new_creator = Participant.objects.filter(user=request.data['user'], chat = chat, id = request.data['id'])[0]
            new_creator.role = roles.filter(role_type=Role.ALL_TYPE)[0]
            new_creator.save()
        else:
            # create new creator profile and update old creator profile
            new_creator = Participant.objects.create(
                role = roles.filter(role_type=Role.ALL_TYPE)[0],
                chat = chat,
                user = new_creator_user
            )
            new_creator.save()
        old_creator = Participant.objects.filter(user=request.user, chat = chat)[0]
        old_creator.role = roles.filter(role_type=Role.READ_WRITE_TYPE)[0]
        old_creator.save()

        return Response({'message': 'Changed chat creator'}, status=status.HTTP_200_OK)