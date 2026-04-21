from django.contrib.auth.models import User
from django.http import JsonResponse
from django_ratelimit import ALL as RATELIMIT_ALL
from django_ratelimit.core import is_ratelimited
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_app.serializers import CheckEmailSerializer


def ratelimited_response(request):
    response = JsonResponse(
        {"detail": "Too many requests. Please try again later."},
        status=429,
    )
    response["Retry-After"] = "3600"
    return response


class CheckEmailView(APIView):
    permission_classes = [AllowAny]

    def dispatch(self, request, *args, **kwargs):
        if is_ratelimited(
            request,
            fn=CheckEmailView.dispatch,
            key="ip",
            rate="20/h",
            method=RATELIMIT_ALL,
            increment=True,
        ):
            return ratelimited_response(request)
        return super().dispatch(request, *args, **kwargs)

    @extend_schema(
        request=CheckEmailSerializer,
        responses={
            200: inline_serializer(
                name="CheckEmailResponse",
                fields={
                    "user_status": serializers.ChoiceField(
                        choices=["new", "returning_password", "returning_otp"]
                    )
                },
            ),
            400: OpenApiResponse(description="Invalid or missing email address."),
            429: OpenApiResponse(
                description="Rate limit exceeded. Retry after 1 hour."
            ),
        },
        summary="Check whether an email address is registered and which auth method it uses.",
        tags=["auth"],
    )
    def post(self, request):
        serializer = CheckEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.select_related("user_profile").get(username=email)
        except User.DoesNotExist:
            return Response({"user_status": "new"})

        auth_method = user.user_profile.auth_method
        if auth_method == "otp":
            user_status = "returning_otp"
        else:
            user_status = "returning_password"

        return Response({"user_status": user_status})
