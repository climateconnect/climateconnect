from typing import List

from climate_match.models import Answer, Question, UserQuestionAnswer
from climateconnect_api.serializers.common import SkillSerializer
from django.utils.translation import get_language
from hubs.models.hub import Hub
from hubs.serializers.hub import HubClimateMatchSerializer
from rest_framework import serializers


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ("id", "text")


class QuestionAnswerSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()
    answer_type = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = (
            "id",
            "text",
            "answer_type",
            "image",
            "step",
            "number_of_choices",
            "answers",
            "minimum_choices_required",
        )

    def get_text(self, obj: Question) -> str:
        user_language_code = get_language()
        if obj.language.language_code != user_language_code:
            return (
                obj.translate_question.filter(
                    language__language_code=user_language_code
                )
                .first()
                .text
            )
        return obj.text

    def get_answer_type(self, obj: Question) -> str:
        return obj.answer_type.model

    def get_answers(self, obj: Question) -> List:
        answers = []
        resource_mapping = [
            {"resource_type": "hub", "filter": {"hub_type": Hub.SECTOR_HUB_TYPE}},
            {"resource_type": "skill", "filter": {"parent_skill": None}},
        ]

        if obj.answer_type.model == "answer":
            predefined_answers = obj.answer_question.all()
            return AnswerSerializer(predefined_answers, many=True).data
        else:
            for resource in resource_mapping:
                if obj.answer_type.model == resource["resource_type"]:
                    resource_objects = obj.answer_type.get_all_objects_for_this_type(
                        **resource["filter"]
                    )
                    if resource["resource_type"] == "hub":
                        resource_objects = (
                            HubClimateMatchSerializer(resource_objects, many=True)
                        ).data
                    if resource["resource_type"] == "skill":
                        resource_objects = (
                            SkillSerializer(resource_objects, many=True)
                        ).data
                    for r_obj in resource_objects:
                        answers.append({"text": r_obj["name"], "id": r_obj["id"]})

        return answers


class AnswerSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ("id", "text")

    def get_text(self, obj: Answer) -> str:
        user_language_code = get_language()
        if obj.language and obj.language.language_code != user_language_code:
            return (
                obj.translate_answer.filter(language__language_code=user_language_code)
                .first()
                .text
            )

        return obj.text


class UserQuestionAnswerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer()
    predefined_answer = AnswerSerializer()
    answers = serializers.SerializerMethodField()
    answer_type = serializers.SerializerMethodField()
    climatematch_token = serializers.SerializerMethodField()

    class Meta:
        model = UserQuestionAnswer
        fields = (
            "id",
            "question",
            "predefined_answer",
            "answers",
            "answer_type",
            "climatematch_token",
        )

    def get_answers(self, obj: UserQuestionAnswer):
        answers = []
        for answer in obj.answers.all():
            resource = answer.resource_type.get_object_for_this_type(
                id=answer.reference_id
            )
            answers.append(
                {"id": resource.id, "name": resource.name, "weight": answer.weight}
            )
        return answers

    def get_answer_type(self, obj: UserQuestionAnswer) -> str:
        return obj.question.answer_type.model

    def get_climatematch_token(self, obj: UserQuestionAnswer) -> str:
        return obj.token
