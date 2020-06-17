from django.urls import path

from organization.views.organization_views import (
    OrganizationAPIView, ListOrganizationsAPIView, CreateOrganizationView
)
from organization.views.project_views import (
    ListProjectsView, ProjectAPIView, ListProjectMembersView,
    CreateProjectView, AddProjectMembersView, UpdateProjectMemberView
)


app_name = 'organization'
urlpatterns = [
    # Organization URLs
    path('organizations/', ListOrganizationsAPIView.as_view(), name='list-organizations-api-view'),
    path('organizations/<slug:url_slug>/', OrganizationAPIView.as_view(), name='organization-api-view'),
    path('create_organization/', CreateOrganizationView.as_view(), name='create-organization-api-view'),

    # Project URLs
    path('projects/', ListProjectsView.as_view(), name='list-projects'),
    path('projects/<int:pk>/', ProjectAPIView.as_view(), name='project-api-view'),
    path('projects/<int:pk>/members/', ListProjectMembersView.as_view(), name='project-members-api'),
    path('create_project/', CreateProjectView.as_view(), name='create-project-api'),
    path(
        'projects/<int:project_id>/add_members/',
        AddProjectMembersView.as_view(), name='add-project-members-api'
    ),
    path(
        'projects/<int:project_id>/members/<int:member_id>/',
        UpdateProjectMemberView.as_view(), name='update-project-member-api'
    )
]
