import logging
import uuid

from climate_match.models import AnswerMetaData, Question, UserQuestionAnswer
from climate_match.models.answers import Answer
from climate_match.serializers.question_answer import (
    QuestionAnswerSerializer,
    UserQuestionAnswerSerializer,
)
from climateconnect_api.models import Skill, UserProfile
from hubs.models import Hub
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

DYNAMIC_ANSWER_TYPE = [Hub, Skill]
STATIC_ANSWER_TYPE = [Answer]


class QuestionAnswerView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        questions = Question.objects.all()
        serializer = QuestionAnswerSerializer(questions, many=True)
        if request.user.is_authenticated:
            has_done_climatematch = UserQuestionAnswer.objects.filter(
                user=request.user
            ).exists()
        elif "climatematch_token" in request.query_params:
            has_done_climatematch = UserQuestionAnswer.objects.filter(
                token=request.query_params["climatematch_token"]
            ).exists()
        else:
            has_done_climatematch = False
        return Response(
            {
                "total_questions": questions.count(),
                "results": serializer.data,
                "has_done_climatematch": has_done_climatematch,
            },
            status=status.HTTP_200_OK,
        )


class UserQuestionAnswersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )

        user_question_answers = UserQuestionAnswer.objects.filter(user=profile.user)
        serializer = UserQuestionAnswerSerializer(user_question_answers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
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
            ],
            'climatematch_token': <optional token if user is not logged in and has done climatematch before>,
            'hub': <url_slug of the (location-)hub the user came from. This is used to determine the results
        }

        """
        is_logged_in = request.user.is_authenticated
        # if the user is logged in, we use their user id as a unique identifier
        if is_logged_in:
            try:
                profile = UserProfile.objects.get(user=request.user)
            except UserProfile.DoesNotExist:
                return Response(
                    {"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
                )
        # If the user is logged out we use a generated uuid which will then be saved in a cookie
        else:
            logged_out_token = (
                uuid.uuid4()
                if "climatematch_token" not in request.data
                else request.data["climatematch_token"]
            )

        if "user_question_answers" not in request.data:
            return Response(
                {"message": "Key not found"}, status=status.HTTP_400_BAD_REQUEST
            )

        user_question_answers = []

        # requried_params will be used inside a for loop to verify all keys are present.
        required_params = [
            "question_id",
            "predefined_answer_id",
            "answers",
            "answer_type",
        ]
        for index, question_answer in enumerate(request.data["user_question_answers"]):
            for param in required_params:
                if param not in question_answer:
                    logger.error(f"ClimateMatchError: Missing parameter -> {param}")
                    continue
            try:
                question = Question.objects.get(id=question_answer["question_id"])
            except Question.DoesNotExist:
                return Response(
                    {"message": "Question does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get django contenttype based on answer_type.
            resource_type = question.answer_type

            # Check if user's question-answer object already exisits.
            # We do not want to create duplicated objects for user.
            if is_logged_in:
                old_question_answer_objects = UserQuestionAnswer.objects.filter(
                    user=profile.user, question_id=question_answer["question_id"]
                )
            else:
                old_question_answer_objects = UserQuestionAnswer.objects.filter(
                    token=logged_out_token, question_id=question_answer["question_id"]
                )
            if old_question_answer_objects.exists():
                question_answer_object = old_question_answer_objects[0]
            else:
                if request.data["hub"]:
                    try:
                        hub_shared_from = Hub.objects.get(url_slug=request.data["hub"])
                    except Hub.DoesNotExist:
                        return Response(
                            {"message": "Hub does not exist."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                else:
                    hub_shared_from = False
                question_answer_object = UserQuestionAnswer.objects.create(
                    question=question
                )
                if is_logged_in:
                    question_answer_object.user = request.user
                else:
                    question_answer_object.token = logged_out_token
                if hub_shared_from:
                    question_answer_object.hub = hub_shared_from
                question_answer_object.save()

            # resource_type is a ContentType instance. model_class retrieves the corresponding model.
            if resource_type.model_class() in STATIC_ANSWER_TYPE:
                try:
                    answer = Answer.objects.get(id=question_answer["answers"]["id"])
                except Answer.DoesNotExist:
                    return Response(
                        {"message": "Answer does not exist"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                question_answer_object.predefined_answer = answer
                question_answer_object.save()
            elif resource_type.model_class() in DYNAMIC_ANSWER_TYPE:
                # For answers where you can choose out of multiple contenttypes such as skills or hubs:
                # Make sure users have selected the minimum amount of answers required
                mc = question.minimum_choices_required
                if len(question_answer["answers"]) < mc:
                    return Response(
                        {
                            "message": "Please choose at least {} to question {}".format(
                                str(mc) + (" answer" if mc < 2 else " answers"),
                                str(index),
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                # Clear the old answers to make room for new answers
                # Without this line all the answers would add up and the results wouldn't make sense anymore
                question_answer_object.answers.clear()
                for answer in question_answer["answers"]:
                    if AnswerMetaData.objects.filter(
                        weight=answer["weight"],
                        resource_type=resource_type,
                        reference_id=answer["id"],
                    ).exists():
                        answer_metadata = AnswerMetaData.objects.get(
                            weight=answer["weight"],
                            resource_type=resource_type,
                            reference_id=answer["id"],
                        )
                    else:
                        answer_metadata = AnswerMetaData.objects.create(
                            weight=answer["weight"],
                            resource_type=resource_type,
                            reference_id=answer["id"],
                        )
                    question_answer_object.answers.add(answer_metadata)
                question_answer_object.save()
            else:
                return Response(
                    {"message": "Invalid answer type"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user_question_answers.append(question_answer_object)

        serializer = UserQuestionAnswerSerializer(user_question_answers, many=True)
        response_payload = {"data": serializer.data}
        if not is_logged_in:
            response_payload["climatematch_token"] = logged_out_token
        return Response(response_payload, status=status.HTTP_201_CREATED)
