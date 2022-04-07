from rest_framework import serializers

from climateconnect_api.models import FaqQuestion


class FaqQuestionSerializer(serializers.ModelSerializer):
    section = serializers.SerializerMethodField()

    class Meta:
        model = FaqQuestion
        fields = ("question", "answer", "section")

    def get_section(self, obj):
        return obj.section.name
