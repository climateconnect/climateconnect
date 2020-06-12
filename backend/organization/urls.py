from django.urls import path

from organization.views.organization_views import OrganizationAPIView
from organization.views.project_views import (
    ListProjectsView, ProjectAPIView, ListProjectMembersView,
    CreateProjectView, OrganizationProjectsView,
    AddProjectMembersView
)


app_name = 'organization'
urlpatterns = [
    path('organizations/', OrganizationAPIView.as_view(), name='organization-api-views'),
    path('projects/', ListProjectsView.as_view(), name='list-projects'),
    path('projects/<int:pk>/', ProjectAPIView.as_view(), name='project-api-view'),
    path('projects/<int:pk>/members/', ListProjectMembersView.as_view(), name='project-members-api'),
    path('create_project/', CreateProjectView.as_view(), name='create-project-api'),
    path(
        'projects/<int:project_id>/add_members/',
        AddProjectMembersView.as_view(), name='add-project-members-api'
    )
]
