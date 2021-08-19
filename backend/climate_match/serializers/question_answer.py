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

    class Meta:
        model = Question
        fields = ('id', 'text', 'predefined_answers')

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


class AnswerMetaDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerMetaData
        fields = '__all__'


class UserQuestionAnswerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer()
    predefined_answer = AnswerSerializer()
    answers = serializers.SerializerMethodField()

    class Meta:
        model = UserQuestionAnswer
        fields = ('id', 'question', 'predefined_answer', 'answers')

    def get_answers(self, obj: UserQuestionAnswer):
        serializer = AnswerMetaDataSerializer(obj.answers.all(), many=True)
        return serializer.data

