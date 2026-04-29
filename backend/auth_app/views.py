import hashlib
import hmac
import logging
import secrets
from datetime import timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import F
from django.http import JsonResponse
from django.utils import timezone
from django_ratelimit import ALL as RATELIMIT_ALL
from django_ratelimit.core import is_ratelimited
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from knox.models import AuthToken
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_app.models import LoginAuditLog, LoginToken
from auth_app.serializers import (
    CheckEmailSerializer,
    RequestTokenSerializer,
    VerifyTokenSerializer,
)
from auth_app.tasks import send_login_code_email
from auth_app.utility.ip import anonymise_ip

logger = logging.getLogger(__name__)


def ratelimited_response(request, reason: str, retry_after: int = 3600):
    logger.info(
        "Rate limited request from IP %s: %s",
        anonymise_ip(request.META.get("REMOTE_ADDR")),
        reason,
    )
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
            return ratelimited_response(request, "IP rate limit exceeded (20/h)", retry_after=3600)
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
            return ratelimited_response(request, "Per-email rate limit exceeded (3/10m)", retry_after=600)
        # Per-IP rate limit: 30 requests per hour
        if is_ratelimited(
            request,
            fn=RequestTokenView.dispatch,
            key="ip",
            rate="30/h",
            method=RATELIMIT_ALL,
            increment=True,
        ):
            return ratelimited_response(request, "IP rate limit exceeded (30/h)", retry_after=3600)
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

        # Resend cooldown: check the most recent active (non-exhausted, non-used, non-expired) token.
        # Exhausted tokens (attempt_count >= 5) should not block the user from requesting a new code.
        recent_token = (
            LoginToken.objects.filter(
                email=email,
                used_at__isnull=True,
                expires_at__gt=now,
                attempt_count__lt=5,
            )
            .order_by("-created_at")
            .first()
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
                logger.info(
                    "Rate limited request from IP %s: %s",
                    anonymise_ip(request.META.get("REMOTE_ADDR")),
                    "Resend cooldown",
                )
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


def _write_audit_log(request, email, user, outcome):
    LoginAuditLog.objects.create(
        email=email,
        user=user,
        outcome=outcome,
        ip_address=anonymise_ip(request.META.get("REMOTE_ADDR")),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
    )


class VerifyTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=VerifyTokenSerializer,
        responses={
            200: inline_serializer(
                name="VerifyTokenResponse",
                fields={
                    "token": serializers.CharField(),
                    "expiry": serializers.DateTimeField(),
                    "user": serializers.DictField(),
                },
            ),
            400: OpenApiResponse(description="Missing session_key or code."),
            401: OpenApiResponse(description="Invalid, expired, or exhausted token."),
        },
        summary="Verify a one-time login code and issue a Knox auth token.",
        tags=["auth"],
    )
    def post(self, request):
        serializer = VerifyTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        session_key = serializer.validated_data["session_key"]
        code = serializer.validated_data["code"]
        now = timezone.now()

        token = (
            LoginToken.objects.select_related("user__user_profile")
            .filter(session_key=session_key)
            .first()
        )

        if token is None:
            LoginAuditLog.objects.create(
                email="",
                user=None,
                outcome=LoginAuditLog.Outcome.FAILED,
                ip_address=anonymise_ip(request.META.get("REMOTE_ADDR")),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
            )
            return Response({"detail": "Invalid or expired session."}, status=401)

        if token.expires_at <= now:
            _write_audit_log(
                request, token.email, token.user, LoginAuditLog.Outcome.EXPIRED
            )
            return Response(
                {"detail": "This code has expired. Please request a new one."},
                status=401,
            )

        if token.used_at is not None:
            _write_audit_log(
                request, token.email, token.user, LoginAuditLog.Outcome.FAILED
            )
            return Response({"detail": "Invalid or expired session."}, status=401)

        if token.attempt_count >= 5:
            _write_audit_log(
                request, token.email, token.user, LoginAuditLog.Outcome.EXHAUSTED
            )
            return Response(
                {"detail": "Too many failed attempts. Please request a new code."},
                status=401,
            )

        submitted_hash = hashlib.sha256(code.encode()).hexdigest()
        if not hmac.compare_digest(submitted_hash, token.token_hash):
            LoginToken.objects.filter(pk=token.pk).update(
                attempt_count=F("attempt_count") + 1
            )
            token.refresh_from_db(fields=["attempt_count"])
            remaining = 5 - token.attempt_count
            if remaining <= 0:
                outcome = LoginAuditLog.Outcome.EXHAUSTED
                detail = "Too many failed attempts. Please request a new code."
            else:
                outcome = LoginAuditLog.Outcome.FAILED
                suffix = "s" if remaining != 1 else ""
                detail = "Invalid code. {} attempt{} remaining.".format(
                    remaining, suffix
                )
            _write_audit_log(request, token.email, token.user, outcome)
            return Response({"detail": detail}, status=401)

        # Code matches — mark token used, verify account if new user, issue Knox token
        with transaction.atomic():
            rows_updated = LoginToken.objects.filter(
                pk=token.pk, used_at__isnull=True
            ).update(used_at=now)
            if rows_updated == 0:
                # Concurrent request already consumed this token
                _write_audit_log(
                    request, token.email, token.user, LoginAuditLog.Outcome.FAILED
                )
                return Response({"detail": "Invalid or expired session."}, status=401)

            user = token.user
            profile = user.user_profile
            if not profile.is_profile_verified:
                profile.is_profile_verified = True
                profile.save(update_fields=["is_profile_verified"])

            _instance, auth_token = AuthToken.objects.create(user=user)

        _write_audit_log(request, token.email, user, LoginAuditLog.Outcome.VERIFIED)

        from climateconnect_api.serializers.user import PersonalProfileSerializer

        user_data = PersonalProfileSerializer(
            profile, context={"request": request}
        ).data

        return Response(
            {
                "token": auth_token,
                "expiry": _instance.expiry,
                "user": user_data,
            }
        )
