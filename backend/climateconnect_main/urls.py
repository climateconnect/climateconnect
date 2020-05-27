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
    status_views, user_views
)
from knox import views as knox_views
from django.conf import settings
from django.conf.urls.static import static
import logging
logger = logging.getLogger(__name__)

logger.info(static(settings.STATIC_URL, document_root=settings.STATIC_ROOT))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ping/', status_views.PingPongView.as_view(), name='ping-pong-api'),
    path('login/', user_views.LoginView.as_view(), name='login-api'),
    path('logout/', knox_views.LogoutView.as_view(), name='logout-api'),
    path('signup/', user_views.SignUpView.as_view(), name="signup-api"),
    path('api/my_profile/', user_views.PersonalProfileView.as_view(), name='user-profile-api'),
    path('api/members/', user_views.MemberProfilesView.as_view(), name="member-profiles-api"),
    path('api/', include('organization.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
