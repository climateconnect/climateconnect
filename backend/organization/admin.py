from django.contrib import admin

from organization.models import (
    Comment,
    CommentTranslation,
    EventRegistration,
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
        "project_parent__parent_user__username",
        "project_parent__parent_user__email",
        "project_parent__parent_user__user_profile__name",
        "project_parent__parent_organization__name",
    )
    list_filter = ("status", "has_children", "project_type")
    list_display = (
        "name",
        "url_slug",
        "status",
        "get_owner",
        "parent_project",
        "has_children",
        "project_type",
        "created_at",
    )
    raw_id_fields = ("parent_project",)  # Better UX for selecting parent project
    readonly_fields = (
        "has_children",
        "created_at",
        "updated_at",
    )  # Managed by signals/auto fields
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "url_slug",
                    "status",
                    "project_type",
                    "short_description",
                    "description",
                    "image",
                    "thumbnail_image",
                    "website",
                    "language",
                )
            },
        ),
        (
            "Location",
            {
                "fields": (
                    "is_online",
                    "loc",
                    "additional_loc_info",
                    "country",
                    "city",
                )
            },
        ),
        (
            "Dates & Status",
            {
                "fields": (
                    "start_date",
                    "end_date",
                    "created_at",
                    "updated_at",
                    "is_draft",
                    "is_active",
                )
            },
        ),
        (
            "Collaboration",
            {
                "fields": (
                    "collaborators_welcome",
                    "helpful_connections",
                    "related_hubs",
                    "rating",
                )
            },
        ),
        (
            "Hierarchy",
            {
                "fields": (
                    "parent_project",
                    "has_children",
                )
            },
        ),
    )

    def get_owner(self, obj):
        """Display the project owner (organization or user)."""
        try:
            project_parent = obj.project_parent.first()
            if project_parent:
                if project_parent.parent_organization:
                    return project_parent.parent_organization.name
                elif project_parent.parent_user:
                    # Try to get the user's profile name, fallback to username
                    if (
                        hasattr(project_parent.parent_user, "user_profile")
                        and project_parent.parent_user.user_profile
                    ):
                        return project_parent.parent_user.user_profile.name
                    return project_parent.parent_user.username
        except Exception:
            pass
        return "-"

    get_owner.short_description = "Owner"


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


class EventRegistrationAdmin(admin.ModelAdmin):
    search_fields = ("project__name", "project__url_slug")
    list_display = (
        "project",
        "max_participants",
        "registration_end_date",
        "status",
        "created_at",
    )
    list_filter = ("status", "registration_end_date")
    raw_id_fields = ("project",)


admin.site.register(EventRegistration, EventRegistrationAdmin)
