from rest_framework.permissions import BasePermission, SAFE_METHODS
from organization.models import (Organization, OrganizationMember, Project, ProjectMember, ProjectParents)
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

class ProjectReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            project = Project.objects.get(url_slug=str(view.kwargs.get('url_slug')))
        except Project.DoesNotExist:
            return False

        if request.method == 'DELETE' and ProjectMember.objects.filter(
            user=request.user, role__role_type=Role.ALL_TYPE, project=project
        ).exists():
            return True

        if request.method in ['PUT', 'PATCH', 'POST'] and ProjectMember.objects.filter(
            user=request.user, role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE], project=project
        ).exists():
            return True

        return False

class OrganizationReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            organization = Organization.objects.get(url_slug=str(view.kwargs.get('url_slug')))
        except Organization.DoesNotExist:
            return False

        if request.method == 'DELETE' and OrganizationMember.objects.filter(
            user=request.user, role__role_type=Role.ALL_TYPE, organization=organization
        ).exists():
            return True

        if request.method in ['PUT', 'PATCH', 'POST'] and OrganizationMember.objects.filter(
            user=request.user, role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE], organization=organization
        ).exists():
            return True

        return False

class OrganizationMemberReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
            
        try:
            organization = Organization.objects.get(url_slug=str(view.kwargs.get('url_slug')))
        except Organization.DoesNotExist:
            return False

        try:
            requesting_member = OrganizationMember.objects.filter(
                user=request.user, role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE], organization=organization
            )
            member_to_update = OrganizationMember.objects.filter(id=int(view.kwargs.get('pk')), organization=organization)
        except OrganizationMember.DoesNotExist:
            return False      

        if requesting_member.exists() and member_to_update.exists(): 
            if requesting_member[0].id == member_to_update[0].id and not requesting_member[0].role.role_type == Role.ALL_TYPE:
                return True
            if requesting_member[0].role.role_type > member_to_update[0].role.role_type:
                return True

        return False

class AddOrganizationMemberPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            organization = Organization.objects.get(url_slug=str(view.kwargs.get('url_slug')))
        except Organization.DoesNotExist:
            return False

        try:
            requesting_member = OrganizationMember.objects.filter(
                user=request.user, role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE], organization=organization
            )
        except OrganizationMember.DoesNotExist:
            return False   

        if 'organization_members' in request.data:
            for member in request.data['organization_members']:
                if 'permission_type_id' not in member:
                    return False
                if member['permission_type_id'] >= requesting_member[0].role.role_type:
                    return False
        return True

class ChangeOrganizationCreatorPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            organization = Organization.objects.get(url_slug=str(view.kwargs.get('url_slug')))
        except Organization.DoesNotExist:
            return False

        try:
            requesting_member = OrganizationMember.objects.filter(
                user=request.user, role__role_type__in=[Role.ALL_TYPE], organization=organization
            )
        except OrganizationMember.DoesNotExist:
            return False   

        if requesting_member:
            return True

        return False