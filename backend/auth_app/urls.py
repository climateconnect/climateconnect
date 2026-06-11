from django.urls import path

from auth_app.views import CheckEmailView, RequestTokenView, VerifyTokenView

urlpatterns = [
    path("auth/check-email", CheckEmailView.as_view(), name="auth-check-email"),
    path("auth/request-token", RequestTokenView.as_view(), name="auth-request-token"),
    path("auth/verify-token", VerifyTokenView.as_view(), name="auth-verify-token"),
]
