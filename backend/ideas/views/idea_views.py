from typing import List
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter

from ideas.models import Idea
from ideas.serializers.idea import IdeaMinimalSerializer
from ideas.pagination import IdeasBoardPagination


class IdeasBoardView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = IdeasBoardPagination
    filter_backends = [SearchFilter]
    search_fields = ['name']
    serializer_class = IdeaMinimalSerializer
    queryset = Idea.objects.all()
