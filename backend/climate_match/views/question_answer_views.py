from django.contrib.contenttypes.models import ContentType
from climate_match.models.answers import Answer
from hubs.models import Hub
from climateconnect_api.models import Skill
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from climate_match.models import AnswerMetaData, Question, UserQuestionAnswer
from climate_match.serializers.question_answer import QuestionAnswerSerializer, \
    UserQuestionAnswerSerializer
from climateconnect_api.models import UserProfile

import logging
logger = logging.getLogger(__name__)

DYNAMIC_ANSWER_TYPE = [Hub, Skill]
STATIC_ANSWER_TYPE = [Answer]


class QuestionAnswerView(APIView):
    permission_classes = [AllowAny]

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
        for (index, question_answer) in enumerate(request.data['user_question_answers']):
            for param in required_params:
                if param not in question_answer:
                    logger.error(f"ClimateMatchError: Missing parameter -> {param}")
                    continue
            try:
                question = Question.objects.get(id=question_answer['question_id'])
            except Question.DoesNotExist:
                return Response({
                    'message': 'Question does not exist'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get django contenttype based on answer_type.
            resource_type = question.answer_type

            # Check if user's question-answer object already exisits.
            # We do not want to create duplicated objects for user.
            if UserQuestionAnswer.objects.filter(
                user=profile.user,
                question_id=question_answer['question_id']
            ).exists():
                user_question_answer = UserQuestionAnswer.objects.get(
                    user=profile.user, question=question
                )
            else:
                user_question_answer = UserQuestionAnswer.objects.create(
                    user=profile.user, question=question
                )

            #resource_type is a ContentType instance. model_class retrieves the corresponding model.
            if resource_type.model_class() in STATIC_ANSWER_TYPE:
                try:
                    answer = Answer.objects.get(id=question_answer['answers']['id'])
                except Answer.DoesNotExist:
                    return Response({
                        'message': 'Answer does not exist'
                    }, status=status.HTTP_400_BAD_REQUEST)
                user_question_answer.predefined_answer = answer
                user_question_answer.save()
            elif resource_type.model_class() in DYNAMIC_ANSWER_TYPE:
                # For answers where you can choose out of multiple contenttypes such as skills or hubs:
                # Make sure users have selected the minimum amount of answers required
                mc = question.minimum_choices_required
                if len(question_answer['answers']) < mc:
                    return Response({
                        'message': 'Please choose at least {} to question {}'.format(
                            mc + ("answer" if mc < 2 else "answers"),
                            index
                        )
                    }, status=status.HTTP_400_BAD_REQUEST)
                # Clear the old answers to make room for new answers
                # Without this line all the answers would add up and the results wouldn't make sense anymore
                user_question_answer.answers.clear()
                for answer in question_answer['answers']:
                    if AnswerMetaData.objects.filter(
                        weight=answer['weight'],
                        resource_type=resource_type,
                        reference_id=answer['id']
                    ).exists():
                        answer_metadata = AnswerMetaData.objects.get(
                            weight=answer['weight'],resource_type=resource_type,
                            reference_id=answer['id']
                        )
                    else:
                        answer_metadata = AnswerMetaData.objects.create(
                            weight=answer['weight'], resource_type=resource_type,
                            reference_id=answer['id']
                        )
                    user_question_answer.answers.add(answer_metadata)
                user_question_answer.save()
            else:
                return Response({
                        'message': 'Invalid answer type'
                    }, status=status.HTTP_400_BAD_REQUEST)
            user_question_answers.append(user_question_answer)

        serializer = UserQuestionAnswerSerializer(user_question_answers, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
