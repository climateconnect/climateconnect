from django.utils.translation import get_language
from rest_framework import serializers

from climateconnect_api.models import Role
from climateconnect_api.utility.common import get_role_name


class RoleSerializer(serializers.ModelSerializer):
    role_type = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    class Meta:
        model = Role
        exclude = ('created_at', 'updated_at')

    def get_role_type(self, obj):
        return Role.ROLE_TYPES[obj.role_type][1]

    def get_name(self, obj):
        return get_role_name(obj, get_language())
