from rest_framework.permissions import BasePermission, SAFE_METHODS
from organization.models import (OrganizationMember, ProjectMember, ProjectParents)
from climateconnect_api.models import Role


class OrganizationProjectCreationPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if OrganizationMember.objects.filter(
                user=request.user, role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE]
        ).exists() or ProjectMember.objects.filter(
            user=request.user, role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE]
        ).exists():
            return True

        return False


class OrganizationReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if OrganizationMember.objects.filter(
            user=request.user, role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE]
        ).exists():
            return True

        return False
