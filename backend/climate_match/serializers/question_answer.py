from django.utils.translation import get_language
from rest_framework import serializers
from climate_match.models import Answer, AnswerTranslation, AnswerMetaData, Question, QuestionTranslation


class QuestionSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'text')

    def get_text(self, obj: Question) -> str:
        user_language_code = get_language()
        if obj.language.language_code != user_language_code:
            return obj.translate_question.filter(language__language_code=user_language_code).first().text
        return obj.text
