from django.contrib import admin

from organization.models import (
    Comment,
    CommentTranslation,
    Organization,
    OrganizationFieldTagging,
    OrganizationFollower,
    OrganizationMember,
    OrganizationSectorMapping,
    OrganizationTagging,
    OrganizationTags,
    OrganizationTranslation,
    OrgProjectPublished,
    Post,
    PostComment,
    PostTranslation,
    Project,
    ProjectCollaborators,
    ProjectComment,
    ProjectFollower,
    ProjectLike,
    ProjectMember,
    ProjectParents,
    ProjectSectorMapping,
    ProjectStatus,
    ProjectTagging,
    ProjectTags,
    ProjectTranslation,
    Sector,
    UserProfileSectorMapping,
)
from organization.models.members import MembershipRequests

pass_through_models = (
    OrganizationTags,
    OrganizationTagging,
    ProjectTags,
    ProjectTagging,
    Post,
    Comment,
    PostComment,
    ProjectComment,
    ProjectStatus,
    ProjectCollaborators,
    ProjectFollower,
    OrganizationFieldTagging,
    PostTranslation,
    CommentTranslation,
    ProjectLike,
    MembershipRequests,
    OrganizationFollower,
    OrgProjectPublished,
    Sector,
    ProjectSectorMapping,
    OrganizationSectorMapping,
    UserProfileSectorMapping,
)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)


class OrganizationAdmin(admin.ModelAdmin):
    search_fields = ("name", "country", "state", "city", "url_slug")


admin.site.register(Organization, OrganizationAdmin)


class ProjectAdmin(admin.ModelAdmin):
    search_fields = (
        "name",
        "url_slug",
        "loc__name",
        "loc__city",
        "loc__state",
        "loc__country",
        "parent_project__name",
        "parent_project__url_slug",
    )
    list_filter = ("status", "has_children", "project_type")
    list_display = (
        "name",
        "url_slug",
        "status",
        "parent_project",
        "has_children",
        "project_type",
        "created_at",
    )
    raw_id_fields = ("parent_project",)  # Better UX for selecting parent project
    readonly_fields = (
        "has_children",
    )  # Managed by signals, should not be manually edited


admin.site.register(Project, ProjectAdmin)


class ProjectMemberAdmin(admin.ModelAdmin):
    search_fields = (
        "user__user_profile__name",
        "user__id",
        "project__name",
    )
    list_filter = ("role__name",)


admin.site.register(ProjectMember, ProjectMemberAdmin)


class OrganizationMemberAdmin(admin.ModelAdmin):
    search_fields = (
        "user__user_profile__name",
        "user__id",
        "organization__name",
    )
    list_filter = ("role__name",)


admin.site.register(OrganizationMember, OrganizationMemberAdmin)


class ProjectParentsAdmin(admin.ModelAdmin):
    search_fields = ("project__name", "organization__name")


admin.site.register(ProjectParents, ProjectParentsAdmin)


class ProjectTranslationAdmin(admin.ModelAdmin):
    search_fields = (
        "language__id",
        "language__name",
        "language__language_code",
        "project__id",
        "project__name",
        "name_translation",
    )
    list_filter = ("language__language_code",)


admin.site.register(ProjectTranslation, ProjectTranslationAdmin)


class OrganizationTranslationAdmin(admin.ModelAdmin):
    search_fields = (
        "language__id",
        "language__name",
        "language__language_code",
        "organization__name",
        "organization__id",
        "name_translation",
    )
    list_filter = ("language__language_code",)


admin.site.register(OrganizationTranslation, OrganizationTranslationAdmin)
