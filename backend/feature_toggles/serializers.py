from rest_framework import serializers
from feature_toggles.models import FeatureToggle


class FeatureToggleSerializer(serializers.ModelSerializer):
    """
    Serializer for the FeatureToggle model.
    Used for admin/management endpoints that expose full toggle details.
    """

    class Meta:
        model = FeatureToggle
        fields = [
            "name",
            "description",
            "production_is_active",
            "staging_is_active",
            "development_is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
