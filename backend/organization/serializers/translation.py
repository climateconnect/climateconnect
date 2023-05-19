from organization.models.translations import ProjectTranslation
from organization.models import OrganizationTranslation
from rest_framework import serializers


class OrganizationTranslationSerializer(serializers.ModelSerializer):
    language = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationTranslation
        fields = (
            "language",
            "short_description_translation",
            "name_translation",
            "is_manual_translation",
            "school_translation",
            "organ_translation",
            "about_translation",
            "get_involved_translation",
        )

    def get_language(self, obj):
        return obj.language.language_code


class ProjectTranslationSerializer(serializers.ModelSerializer):
    language = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTranslation
        fields = (
            "language",
            "short_description_translation",
            "name_translation",
            "is_manual_translation",
            "description_translation",
            "helpful_connections_translation",
        )

    def get_language(self, obj):
        return obj.language.language_code
