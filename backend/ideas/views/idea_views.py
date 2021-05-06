from typing import List
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from ideas.models import Idea
from ideas.serializers.idea import IdeaMinimalSerializer


class IdeasBoardView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IdeaMinimalSerializer
    queryset = Idea.objects.all()
