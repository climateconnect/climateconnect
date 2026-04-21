from django.urls import path

from auth_app.views import CheckEmailView

urlpatterns = [
    path("auth/check-email", CheckEmailView.as_view(), name="auth-check-email"),
]
