from climateconnect_api.models.user import UserProfileTranslation
from rest_framework import serializers


class UserProfileTranslationSerializer(serializers.ModelSerializer):
    language = serializers.SerializerMethodField()

    class Meta:
        model = UserProfileTranslation
        fields = ("language", "biography_translation", "is_manual_translation")

    def get_language(self, obj):
        return obj.language.language_code
