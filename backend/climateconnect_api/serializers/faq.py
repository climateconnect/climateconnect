from rest_framework import serializers
from django.utils.translation import get_language

from climateconnect_api.models import FaqQuestion
from climateconnect_api.utility.faq import get_section_name, get_question, get_answer


class FaqQuestionSerializer(serializers.ModelSerializer):
    section = serializers.SerializerMethodField()
    question = serializers.SerializerMethodField()
    answer = serializers.SerializerMethodField()

    class Meta:
        model = FaqQuestion
        fields = ("section", "question", "answer")

    def get_section(self, obj):
        return get_section_name(obj, get_language())

    def get_question(self, obj):
        return get_question(obj, get_language())

    def get_answer(self, obj):
        return get_answer(obj, get_language())
