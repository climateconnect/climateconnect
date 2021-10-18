from django.contrib.contenttypes.models import ContentType
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from climate_match.models import AnswerMetaData, Question, UserQuestionAnswer
from climate_match.serializers.question_answer import QuestionAnswerSerializer, \
    UserQuestionAnswerSerializer
from climateconnect_api.models import UserProfile

import logging
logger = logging.getLogger(__name__)

DYNAMIC_ANSWER_TYPE = ['hub', 'skill']
STATIC_ANSWER_TYPE = ['answer']


class QuestionAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        questions = Question.objects.all()
        serializer = QuestionAnswerSerializer(questions, many=True)
        return Response({
            'total_questions': questions.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


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

    def post(self, request, url_slug):
        """
        request data layout:
        {
            'user_question_answers': [
                {
                    'question_id': <ID of climate_match_question (Question) table>,
                    'predefined_answer_id': <ID of climate_match_answer (Answer) table>,
                    'answers': [
                        {
                            'id': <ID of entity. Example: Hub, Skills, Projects, Ideas etc>,
                            'weight': weight of the entity. i.e: Hub, Skills etc,
                            'name': Name of the entity. Note: This is not a required field
                        }
                    ],
                    'answer_type': <What entity are we storing for this question?
                    i.e. Hub, Skill or Predefined Answer(climate_match_answer).>
                }
            ]
        }

        """
        try:
            profile = UserProfile.objects.get(url_slug=str(url_slug))
        except UserProfile.DoesNotExist:
            return Response({'message': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'user_question_answers' not in request.data:
            return Response({
                'message': 'Key not found'
            }, status=status.HTTP_400_BAD_REQUEST)

        user_question_answers = []

        # requried_params will be used inside a for loop to verify all keys are present.
        required_params = ['question_id', 'predefined_answer_id', 'answers', 'answer_type']
        for question_answer in request.data['user_question_answers']:
            for param in required_params:
                if param not in question_answer:
                    logger.error(f"ClimateMatchError: Missing parameter -> {param}")
                    continue

            # Get django contenttype based on answer_type.
            resource_type = ContentType.objects.get(model=question_answer['answer_type'])

            # Check if user's question-answer object already exisits.
            # We do not want to create duplicated objects for user.
            if UserQuestionAnswer.objects.filter(
                user=profile.user,
                question_id=question_answer['question_id']
            ).exists():
                user_question_answer = UserQuestionAnswer.objects.get(
                    user=profile.user, question_id=question_answer['question_id']
                )
            else:
                user_question_answer = UserQuestionAnswer.objects.create(
                    user=profile.user, question_id=question_answer['question_id']
                )

            # Clear current answer metadata objects before adding new objects
            # in answer metadata.
            user_question_answer.answers.clear()

            if question_answer['answer_type'] in STATIC_ANSWER_TYPE:
                user_question_answer.predefined_answer_id = question_answer['predefined_answer_id']
                user_question_answer.save()
            elif question_answer['answer_type'] in DYNAMIC_ANSWER_TYPE:
                for answer in question_answer['answers']:
                    if AnswerMetaData.objects.filter(
                        weight=answer['weight'],
                        resource_type=resource_type,
                        reference_id=answer['id']
                    ).exists():
                        answer_metadata = AnswerMetaData.objects.filter(
                            weight=answer['weight'],resource_type=resource_type,
                            reference_id=answer['id']
                        ).first()
                    else:
                        answer_metadata = AnswerMetaData.objects.create(
                            weight=answer['weight'], resource_type=resource_type,
                            reference_id=answer['id']
                        )
                    user_question_answer.answers.add(answer_metadata)
                user_question_answer.save()
            user_question_answers.append(user_question_answer)

        serializer = UserQuestionAnswerSerializer(user_question_answers, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
