# Python imports

# Django/Django REST imports
import logging

from chat_messages.models.message import MessageParticipants, Participant
from chat_messages.utility.chat_setup import create_private_or_group_chat
# Climate connect imports
from climateconnect_api.models import Language, Role
from climateconnect_api.utility.translation import get_translations
from hubs.models.hub import Hub
from ideas.models import Idea
from ideas.pagination import IdeasBoardPagination
from ideas.permissions import IdeaReadWritePermission
from ideas.serializers.idea import IdeaMinimalSerializer, IdeaSerializer
from ideas.utility.idea import create_idea, verify_idea, idea_translations
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class IdeasBoardView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = IdeasBoardPagination
    filter_backends = [SearchFilter]
    search_fields = ['name']
    serializer_class = IdeaMinimalSerializer
    queryset = Idea.objects.all()


# This is API view is used to edit one idea
class IdeaView(APIView):
    permission_classes = [IdeaReadWritePermission]

    def get(self, request, url_slug, format=None):
        idea = verify_idea(url_slug)
        if not idea:
            return Response({'message': 'Idea not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = IdeaSerializer(idea)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, url_slug, format=None):
        idea = verify_idea(url_slug)
        if not idea:
            return Response({'message': 'Idea not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = IdeaSerializer(data=request.data)

        if serializer.is_valid():
            idea = serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
         
        return Response(None, status=status.HTTP_400_BAD_REQUEST)


class CreateIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        required_params = [
            'name', 'short_description', 'hub', 
            'location', 'source_language'
        ]
        for param in required_params:
            if param not in request.data:
                raise ValidationError('Required parameter missing: ' + param)
        texts = {
            "name": request.data['name'], 
            "short_description": request.data['short_description']
        }
        try:
            translations = get_translations(
                texts, 
                {},
                request.data['source_language']
            )
        except ValueError as ve:
            translations = None
            logger.error("TranslationFailed: Error translating texts, {}".format(ve))
        
        language = None
        if translations:
            language = Language.objects.get(language_code=translations['source_language'])
        
        idea = create_idea(request.data, language, request.user)

        # translate idea
        if translations:
            idea_translations(
                idea=idea, translations=translations['translations'],
                source_language=language
            )

        # Creating group chat for the idea.
        if idea:
            create_private_or_group_chat(creator=request.user, group_chat_name=idea.name, related_idea=idea)
        serializer = IdeaSerializer(idea) 
        return Response(str(serializer.data), status=status.HTTP_200_OK)


class JoinIdeaChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        idea = verify_idea(url_slug)
        if not idea:
            return Response({'message': 'Idea not found'}, status=status.HTTP_404_NOT_FOUND)
        try:
            chat = MessageParticipants.objects.get(related_idea=idea.id)
            try:
                Participant.objects.get(user=request.user, chat=chat)
            except Participant.DoesNotExist:
                Participant.objects.create(user=request.user, chat=chat, role=Role.READ_ONLY_TYPE)
        except MessageParticipants.DoesNotExist:
            return Response({'message': 'Group chat not found'}, status=status.HTTP_404_NOT_FOUND)
        # Participant.objects.get_or_create(user=request.user, chat=idea.related_idea_message_participant)
        return Response({'chat_uuid': chat.chat_uuid}, status=status.HTTP_200_OK)


class GetHaveIJoinedIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):
        idea = verify_idea(url_slug)
        if not idea:
            return Response({'message': 'Idea not found'}, status=status.HTTP_404_NOT_FOUND)
        try:
            chat = MessageParticipants.objects.get(related_idea=idea.id)
            participant = Participant.objects.filter(user=request.user, chat=chat)
            if participant.exists():
                return Response({
                    'chat_uuid': chat.chat_uuid, 
                    'has_joined': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({'has_joined': False}, status=status.status.HTTP_200_OK)
        except MessageParticipants.DoesNotExist:
            return Response({'message': 'Group chat not found'}, status=status.HTTP_404_NOT_FOUND)
