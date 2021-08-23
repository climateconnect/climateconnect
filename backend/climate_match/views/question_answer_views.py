from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from climate_match.models import Question, UserQuestionAnswer
from climate_match.serializers.question_answer import QuestionAnswerSerializer, \
    UserQuestionAnswerSerializer
from climateconnect_api.models import UserProfile


class QuestionAnswerView(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.all()
    serializer_class = QuestionAnswerSerializer


class UserQuestionAnswersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):
        try:
            profile = UserProfile.objects.get(url_slug=str(url_slug))
        except UserProfile.DoesNotExist:
            return Response({'message': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        user_question_answers = UserQuestionAnswer.objects.filter(user=profile.user)
        serializer = UserQuestionAnswerSerializer(user_question_answers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
