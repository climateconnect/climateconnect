from django.urls import path

from organization.views.organization_views import OrganizationAPIView
from organization.views.project_views import (ListProjectsView, ProjectAPIView)


app_name = 'organization'
urlpatterns = [
    path('organizations/', OrganizationAPIView.as_view(), name='organization-api-views'),
    path('projects/', ListProjectsView.as_view(), name='list-projects'),
    path('projects/<pk>/', ProjectAPIView.as_view(), name='project-api-view')
]
