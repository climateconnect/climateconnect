from typing import Dict
from django.utils.translation import get_language
from rest_framework import serializers
from climate_match.models import Answer, AnswerMetaData, Question, UserQuestionAnswer


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'text')


class QuestionAnswerSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()
    predefined_answers = serializers.SerializerMethodField()
    answer_type = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'text', 'predefined_answers', 'answer_type', 'image')

    def get_text(self, obj: Question) -> str:
        user_language_code = get_language()
        if obj.language.language_code != user_language_code:
            return obj.translate_question.filter(
                language__language_code=user_language_code
            ).first().text
        return obj.text

    def get_predefined_answers(self, obj: Question) -> Dict:
        answers = obj.answer_question.all()
        return AnswerSerializer(answers, many=True).data
    
    def get_answer_type(self, obj: Question) -> str:
        return obj.answer_type.name


class AnswerSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ('id', 'text')

    def get_text(self, obj: Answer) -> str:
        user_language_code = get_language()
        if obj.language and obj.language.language_code != user_language_code:
            return obj.translate_answer.filter(
                language__language_code=user_language_code
            ).first().text

        return obj.text


class UserQuestionAnswerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer()
    predefined_answer = AnswerSerializer()
    answers = serializers.SerializerMethodField()
    answer_type = serializers.SerializerMethodField()

    class Meta:
        model = UserQuestionAnswer
        fields = ('id', 'question', 'predefined_answer', 'answers', 'answer_type')

    def get_answers(self, obj: UserQuestionAnswer):
        answers = []
        for answer in obj.answers.all():
            resource = answer.resource_type.get_object_for_this_type(id=answer.reference_id)
            answers.append({
                'id': resource.id, 'name': resource.name, 'weight': answer.weight
            })
        return answers
    
    def get_answer_type(self, obj: UserQuestionAnswer) -> str:
        return obj.question.answer_type.model
