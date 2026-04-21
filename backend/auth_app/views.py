import hashlib
import logging
import secrets
from datetime import timedelta

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from django_ratelimit import ALL as RATELIMIT_ALL
from django_ratelimit.core import is_ratelimited
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_app.models import LoginAuditLog, LoginToken
from auth_app.serializers import CheckEmailSerializer, RequestTokenSerializer
from auth_app.tasks import send_login_code_email
from auth_app.utility.ip import anonymise_ip

logger = logging.getLogger(__name__)


def ratelimited_response(request, retry_after: int = 3600):
    response = JsonResponse(
        {"detail": "Too many requests. Please try again later."},
        status=429,
    )
    response["Retry-After"] = str(retry_after)
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
            return ratelimited_response(request, retry_after=3600)
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


class RequestTokenView(APIView):
    permission_classes = [AllowAny]

    def dispatch(self, request, *args, **kwargs):
        # Per-email rate limit: 3 requests per 10 minutes
        if is_ratelimited(
            request,
            fn=RequestTokenView.dispatch,
            key="post:email",
            rate="3/10m",
            method=RATELIMIT_ALL,
            increment=True,
        ):
            return ratelimited_response(request, retry_after=600)
        # Per-IP rate limit: 30 requests per hour
        if is_ratelimited(
            request,
            fn=RequestTokenView.dispatch,
            key="ip",
            rate="30/h",
            method=RATELIMIT_ALL,
            increment=True,
        ):
            return ratelimited_response(request, retry_after=3600)
        return super().dispatch(request, *args, **kwargs)

    @extend_schema(
        request=RequestTokenSerializer,
        responses={
            200: inline_serializer(
                name="RequestTokenResponse",
                fields={"session_key": serializers.CharField()},
            ),
            400: OpenApiResponse(description="Invalid or missing email address."),
            429: OpenApiResponse(description="Rate limit or resend cooldown exceeded."),
        },
        summary="Request a one-time login code by email.",
        tags=["auth"],
    )
    def post(self, request):
        serializer = RequestTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        now = timezone.now()

        # Resend cooldown: check the most recent token for this email
        recent_token = (
            LoginToken.objects.filter(email=email).order_by("-created_at").first()
        )
        if recent_token is not None:
            seconds_since = (now - recent_token.created_at).total_seconds()
            if seconds_since < 60:
                retry_after = int(60 - seconds_since) + 1
                LoginAuditLog.objects.create(
                    email=email,
                    user=None,
                    outcome=LoginAuditLog.Outcome.RESENT,
                    ip_address=anonymise_ip(request.META.get("REMOTE_ADDR")),
                    user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
                )
                response = JsonResponse(
                    {"detail": "Please wait before requesting another code."},
                    status=429,
                )
                response["Retry-After"] = str(retry_after)
                return response

        # User lookup (enumeration-safe: always returns 200)
        user = User.objects.filter(username=email).first()

        session_key = secrets.token_hex(32)

        if user is None:
            LoginAuditLog.objects.create(
                email=email,
                user=None,
                outcome=LoginAuditLog.Outcome.REQUESTED,
                ip_address=anonymise_ip(request.META.get("REMOTE_ADDR")),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
            )
            return Response({"session_key": session_key})

        # Invalidate previous active tokens and determine outcome
        invalidated = LoginToken.objects.filter(
            email=email,
            used_at__isnull=True,
            expires_at__gt=now,
        ).update(used_at=now)
        outcome = (
            LoginAuditLog.Outcome.RESENT
            if invalidated > 0
            else LoginAuditLog.Outcome.REQUESTED
        )

        # Generate token
        raw_code = str(secrets.randbelow(1_000_000)).zfill(6)
        token_hash = hashlib.sha256(raw_code.encode()).hexdigest()
        expires_at = now + timedelta(minutes=15)

        LoginToken.objects.create(
            user=user,
            email=email,
            token_hash=token_hash,
            session_key=session_key,
            expires_at=expires_at,
        )

        LoginAuditLog.objects.create(
            email=email,
            user=user,
            outcome=outcome,
            ip_address=anonymise_ip(request.META.get("REMOTE_ADDR")),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
        )

        # Enqueue email (raw_code not persisted beyond this call)

        send_login_code_email.delay(user_id=user.id, code=raw_code)

        return Response({"session_key": session_key})
