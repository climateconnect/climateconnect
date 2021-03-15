"""climateconnect_main URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from climateconnect_api.views import (
    status_views, user_views, common_views,
    settings_views, common_views, role_views, 
    faq_views, notifications_views, donation_views
)
from knox import views as knox_views
from django.conf import settings
from django.conf.urls.static import static



urls = [
    path('admin/', admin.site.urls),
    path('ping/', status_views.PingPongView.as_view(), name='ping-pong-api'),
    # User views
    path('login/', user_views.LoginView.as_view(), name='login-api'),
    path('logout/', knox_views.LogoutView.as_view(), name='logout-api'),
    path('signup/', user_views.SignUpView.as_view(), name="signup-api"),
    path('api/my_profile/', user_views.PersonalProfileView.as_view(), name='user-profile-api'),
    path('api/member/<str:url_slug>/', user_views.MemberProfileView.as_view(), name='get-member-profile-api'),
    path('api/member/<str:url_slug>/projects/', user_views.ListMemberProjectsView.as_view(), name='get-member-profile-api'),
    path('api/member/<str:url_slug>/organizations/', user_views.ListMemberOrganizationsView.as_view(), name='get-member-profile-api'),
    path('api/members/', user_views.ListMemberProfilesView.as_view(), name="member-profiles-api"),
    path(
        'api/account_settings/',
        settings_views.UserAccountSettingsView.as_view(),
        name='user-account-settings-api'
    ),
    path('api/edit_profile/', user_views.EditUserProfile.as_view(), name='edit-user-profile-api'),
    path(
        'api/verify_profile/',
        user_views.UserEmailVerificationLinkView.as_view(), name='user-email-verification-link-api'
    ),
    path(
        'api/verify_new_email/',
        settings_views.ChangeEmailView.as_view(), name='user-new-email-verification-link-api'
    ),
    path(
        'api/send_reset_password_email/',
        user_views.SendResetPasswordEmail.as_view(), name='send-reset-password-email'
    ),
    path(
        'api/set_new_password/',
        user_views.SetNewPassword.as_view(), name='set-new-password'
    ),
    path(
        'api/resend_verification_email/',
        user_views.ResendVerificationEmail.as_view(), name='resend-verification-email'
    ),
    path('availability/', common_views.ListAvailabilitiesView.as_view(), name='list-availabilities-api'),
    path('skills/', common_views.ListSkillsView.as_view(), name='list-skills-api'),
    path('roles/', role_views.ListRolesView.as_view(), name='list-roles-api'),
    path(
        'api/feedback/',
        common_views.ReceiveFeedback.as_view(), name='receive-feedback'
    ),
    path(
        'api/list_faq/',
        faq_views.ListFaqView.as_view(), name='list-faq'
    ),
    path(
        'api/notifications/',
        notifications_views.ListNotificationsView.as_view(), name='list-notifications'
    ),
    path('api/sitemap/members/', user_views.ListMembersForSitemap.as_view(), name='list-members-for-sitemap'),
    path('api/set_user_notifications_read/', notifications_views.SetUserNotificationsRead.as_view(), name='set-user-notifications-unread'),
    path('api/donation_goal_progress/', donation_views.GetDonationGoalProgress.as_view(), name='get-donations-this-month'),
    # Organization views
    path('api/', include('organization.urls')),
    # chat messages views
    path('api/', include('chat_messages.urls')),
    #hub views
    path('api/', include('hubs.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG == "True":
    import debug_toolbar
    urlpatterns = urls + [path('__debug__/', include(debug_toolbar.urls))]
else:
    urlpatterns = urls