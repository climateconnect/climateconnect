from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from climateconnect_api.models.role import Role
from climateconnect_api.serializers.role import RoleSerializer


class ListRolesView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RoleSerializer

    def get_queryset(self):
        return Role.objects.all()
