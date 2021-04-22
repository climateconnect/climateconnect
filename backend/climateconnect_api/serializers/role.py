from rest_framework import serializers

from climateconnect_api.models import Role


class RoleSerializer(serializers.ModelSerializer):
    role_type = serializers.SerializerMethodField()
    class Meta:
        model = Role
        exclude = ('created_at', 'updated_at')

    def get_role_type(self, obj):
        return Role.ROLE_TYPES[obj.role_type][1]
