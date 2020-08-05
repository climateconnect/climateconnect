from django.urls import path

from organization.views import organization_views, project_views

app_name = 'organization'
urlpatterns = [
    # Organization URLs
    path(
        'organizations/',
         organization_views.ListOrganizationsAPIView.as_view(),
        name='list-organizations-api-view'
    ),
    path(
        'organizations/<str:url_slug>/',
        organization_views.OrganizationAPIView.as_view(),
        name='organization-api-view'
    ),
    path(
        'organizations/<str:url_slug>/projects/',
        organization_views.ListOrganizationProjectsAPIView.as_view(),
        name='organization-projects-api-view'
    ),
    path(
        'organizations/<str:url_slug>/members/',
        organization_views.ListOrganizationMembersAPIView.as_view(),
        name='organization-members-api-view'
    ),
    path(
        'create_organization/',
        organization_views.CreateOrganizationView.as_view(),
        name='create-organization-api-view'
    ),
    path(
        'organizations/<str:url_slug>/members/',
        organization_views.ListCreateOrganizationMemberView.as_view(), name='list-create-organization-member-view'
    ),
    path(
        'organizations/<str:url_slug>/update_member/<int:pk>/',
        organization_views.UpdateOrganizationMemberView.as_view(), name='update-organization-member-view'
    ),
    path(
        'organizations/<str:url_slug>/add_members/',
        organization_views.AddOrganizationMembersView.as_view(), name='add-organization-member-view'
    ),
    path(
        'organizations/<str:url_slug>/change_creator/',
        organization_views.ChangeOrganizationCreator.as_view(), name='change-organization-creator-view'
    ),
    path(
        'organizationtags/',
        organization_views.ListOrganizationTags.as_view(), name='list-organization-tags'
    ),
    path(
        'my_organizations/',
        organization_views.PersonalOrganizationsView.as_view(),
        name='get-personal-organizations-view'
    ),
    # Project URLs
    path('projects/', project_views.ListProjectsView.as_view(), name='list-projects'),
    path('projects/<str:url_slug>/', project_views.ProjectAPIView.as_view(), name='project-api-view'),
    path('projects/<str:url_slug>/members/', project_views.ListProjectMembersView.as_view(), name='project-members-api'),
    path('projects/<str:url_slug>/posts/', project_views.ListProjectPostsView.as_view(), name="project-posts-api"),
    path('projects/<str:url_slug>/comments/', project_views.ListProjectCommentsView.as_view(), name="project-comments-api"),
    path('create_project/', project_views.CreateProjectView.as_view(), name='create-project-api'),
    path(
        'projects/<str:url_slug>/add_members/',
        project_views.AddProjectMembersView.as_view(), name='add-project-members-api'
    ),
    path(
        'projects/<str:url_slug>/members/<int:pk>/',
        project_views.UpdateProjectMemberView.as_view(), name='update-project-member-api'
    ),
    path(
        'projects/<str:url_slug>/change_creator/',
        project_views.ChangeProjectCreator.as_view(), name='change-project-creator-view'
    ),
    path(
        'projects/<str:url_slug>/set_follow/',
        project_views.SetFollowView.as_view(), name='set-follow-view'
    ),
    path(
        'projects/<str:url_slug>/am_i_following/',
        project_views.IsUserFollowing.as_view(), name='am-i-following-view'
    ),
    path(
        'projects/<str:url_slug>/comment/',
        project_views.ProjectCommentView.as_view(), name='am-i-following-view'
    ),
    path(
        'projects/<str:url_slug>/comment/<int:comment_id>/',
        project_views.ProjectCommentView.as_view(), name='am-i-following-view'
    ),
    path('projecttags/', project_views.ListProjectTags.as_view(), name='list-project-tags'),
    path('projectstatus/', project_views.ListProjectStatus.as_view(), name='list-project-status')
]