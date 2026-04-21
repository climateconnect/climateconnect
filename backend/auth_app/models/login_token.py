import uuid

from django.db import models


class LoginToken(models.Model):
    """
    Short-lived operational token used in the OTP login flow.

    One active token per email at a time. Invalidation is handled at the
    service/view layer — not via a DB unique constraint, because invalidation
    means deleting or soft-flagging the old record before inserting the new one.

    Retention policy (enforced by CleanupLoginTokens Celery task):
    - Used tokens: deleted 24 h after use.
    - Unused expired tokens: deleted 1 h after expires_at.

    The raw 6-digit code is NEVER stored here — only its SHA-256 hash.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="login_tokens",
        help_text="Set after user lookup; null while email is unrecognised (enumeration prevention).",
    )

    email = models.EmailField(
        db_index=True,
        help_text="Email address the code was sent to.",
    )

    token_hash = models.CharField(
        max_length=64,
        help_text="SHA-256 hash of the raw 6-digit code. Raw code is never stored.",
    )

    session_key = models.CharField(
        max_length=64,
        unique=True,
        help_text="32-byte hex random value; ties the token to the specific browser tab.",
    )

    expires_at = models.DateTimeField(
        db_index=True,
        help_text="Expiry time — set to now + 15 minutes on creation.",
    )

    used_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Set on first successful use. Null means the token has not been used yet.",
    )

    attempt_count = models.PositiveSmallIntegerField(
        default=0,
        help_text="Incremented on each failed verification attempt. Token is locked at 5.",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "auth_app"
        verbose_name = "Login Token"
        verbose_name_plural = "Login Tokens"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        return f"LoginToken({self.email}, expires={self.expires_at}, used={self.used_at is not None})"
