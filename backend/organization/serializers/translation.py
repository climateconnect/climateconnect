from climateconnect_api.models import Language
from organization.models import OrganizationTranslation
from rest_framework import serializers


class OrganizationTranslationSerializer(serializers.ModelSerializer):
    language = serializers.SerializerMethodField()
    class Meta:
        model = OrganizationTranslation
        fields = (
            'language', 'short_description_translation',
            'name_translation', 'is_manual_translation',
            'school_translation', 'organ_translation'
        )
    
    def get_language(self, obj):
        return obj.language.language_code