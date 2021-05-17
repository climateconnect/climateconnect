from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter

from ideas.models import Idea
from ideas.serializers.idea import (
    IdeaMinimalSerializer, IdeaSerializer
)
from ideas.pagination import IdeasBoardPagination
from ideas.permissions import IdeaReadWritePermission
from ideas.utility.idea import verify_idea


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
