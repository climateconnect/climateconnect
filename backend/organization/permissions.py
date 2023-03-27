from rest_framework.permissions import BasePermission, SAFE_METHODS

from organization.models import (
    Organization,
    OrganizationMember,
    Project,
    ProjectMember,
    ProjectParents,
)
from climateconnect_api.models import Role
from django.db.models import Q


class OrganizationProjectCreationPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if (
            OrganizationMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            ).exists()
            or ProjectMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            ).exists()
        ):
            return True

        return False


class ProjectReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            project = Project.objects.get(url_slug=str(view.kwargs.get("url_slug")))
        except Project.DoesNotExist:
            return False

        if (
            request.method == "DELETE"
            and ProjectMember.objects.filter(
                user=request.user, role__role_type=Role.ALL_TYPE, project=project
            ).exists()
        ):
            return True

        if (
            request.method in ["PUT", "PATCH", "POST"]
            and ProjectMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
                project=project,
            ).exists()
        ):
            return True

        return False


class ReadWriteSensibleProjectDataPermission(BasePermission):
    def has_permission(self, request, view):
        try:
            project = Project.objects.get(url_slug=str(view.kwargs.get("url_slug")))
        except Project.DoesNotExist:
            return False
        if ProjectMember.objects.filter(
            Q(user=request.user)
            & Q(
                Q(role__role_type=Role.ALL_TYPE)
                | Q(role__role_type=Role.READ_WRITE_TYPE)
            )
            & Q(project=project)
        ).exists():
            return True
        return False


class OrganizationReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            organization = Organization.objects.get(
                url_slug=str(view.kwargs.get("url_slug"))
            )
        except Organization.DoesNotExist:
            return False

        if (
            request.method == "DELETE"
            and OrganizationMember.objects.filter(
                user=request.user,
                role__role_type=Role.ALL_TYPE,
                organization=organization,
            ).exists()
        ):
            return True

        if (
            request.method in ["PUT", "PATCH", "POST"]
            and OrganizationMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
                organization=organization,
            ).exists()
        ):
            return True

        return False


class OrganizationMemberReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            organization = Organization.objects.get(
                url_slug=str(view.kwargs.get("url_slug"))
            )
        except Organization.DoesNotExist:
            return False

        try:
            requesting_member = OrganizationMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
                organization=organization,
            )
            member_to_update = OrganizationMember.objects.filter(
                id=int(view.kwargs.get("pk")), organization=organization
            )
        except OrganizationMember.DoesNotExist:
            return False
        if requesting_member.exists() and member_to_update.exists():
            if (
                requesting_member[0].id == member_to_update[0].id
                and not requesting_member[0].role.role_type == Role.ALL_TYPE
            ):
                return True
            if requesting_member[0].role.role_type > member_to_update[0].role.role_type:
                return True

        return False


class ProjectMemberReadWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        try:
            project = Project.objects.get(url_slug=str(view.kwargs.get("url_slug")))
        except Project.DoesNotExist:
            return False

        try:
            requesting_member = ProjectMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
                project=project,
            )
            member_to_update = ProjectMember.objects.filter(
                id=int(view.kwargs.get("pk")), project=project
            )
        except ProjectMember.DoesNotExist:
            return False
        if requesting_member.exists() and member_to_update.exists():
            if requesting_member[0].id == member_to_update[0].id:
                if (
                    requesting_member[0].role.role_type == Role.ALL_TYPE
                    and not requesting_member[0].role.role_type
                    == member_to_update[0].role.role_type
                ):
                    return False
                else:
                    return True
            if requesting_member[0].role.role_type > member_to_update[0].role.role_type:
                return True
        return False


class AddOrganizationMemberPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            organization = Organization.objects.get(
                url_slug=str(view.kwargs.get("url_slug"))
            )
        except Organization.DoesNotExist:
            return False

        try:
            requesting_member = OrganizationMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
                organization=organization,
            )
        except OrganizationMember.DoesNotExist:
            return False

        if "organization_members" in request.data:
            for member in request.data["organization_members"]:
                if "permission_type_id" not in member:
                    return False
                try:
                    new_member_role = Role.objects.filter(
                        id=int(member["permission_type_id"])
                    )[0]
                except Role.DoesNotExist:
                    return False
                if new_member_role.role_type >= requesting_member[0].role.role_type:
                    return False
        return True


class AddProjectMemberPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            project = Project.objects.get(url_slug=str(view.kwargs.get("url_slug")))
        except Project.DoesNotExist:
            return False

        try:
            requesting_member = ProjectMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
                project=project,
            )
        except ProjectMember.DoesNotExist:
            return False

        if "project_members" in request.data:
            for member in request.data["project_members"]:
                if "permission_type_id" not in member:
                    return False
                try:
                    new_member_role = Role.objects.filter(
                        id=int(member["permission_type_id"])
                    )[0]
                except Role.DoesNotExist:
                    return False
                if new_member_role.role_type >= requesting_member[0].role.role_type:
                    return False
        return True


class ChangeOrganizationCreatorPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            organization = Organization.objects.get(
                url_slug=str(view.kwargs.get("url_slug"))
            )
        except Organization.DoesNotExist:
            return False

        try:
            requesting_member = OrganizationMember.objects.filter(
                user=request.user,
                role__role_type__in=[Role.ALL_TYPE],
                organization=organization,
            )
        except OrganizationMember.DoesNotExist:
            return False

        if requesting_member:
            return True

        return False


class ChangeProjectCreatorPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        try:
            project = Project.objects.get(url_slug=str(view.kwargs.get("url_slug")))
        except Project.DoesNotExist:
            return False

        try:
            requesting_member = ProjectMember.objects.filter(
                user=request.user, role__role_type__in=[Role.ALL_TYPE], project=project
            )
        except ProjectMember.DoesNotExist:
            return False

        if requesting_member:
            return True

        return False


class ApproveDenyProjectMemberRequest(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if not request.user.is_authenticated:
            print(f"{request.user} is not authenticated")
            return False

        project = Project.objects.filter(
            url_slug=str(view.kwargs.get("url_slug"))
        ).first()

        # When calling from the POST in ManageJoinProjectView, Verify
        # that we don't have duplicate requests causing the error to be thrown,
        # or some other method.
        permission_exists = ProjectMember.objects.filter(
            project=project, user=request.user, role__role_type__in=[Role.ALL_TYPE]
        ).exists()

        return permission_exists
