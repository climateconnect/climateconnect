from rest_framework import serializers

from climateconnect_api.models import Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        exclude = ('created_at', 'updated_at')
