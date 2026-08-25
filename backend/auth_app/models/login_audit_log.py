import uuid

from django.db import models


class LoginAuditLog(models.Model):
    """
    Append-only audit table for security monitoring of OTP login events.

    This table MUST NOT be mutated after a row is written. Use Django admin
    in read-only mode. Do not call .save() on existing instances.

    Retention policy: entries purged after 90 days by the
    CleanupLoginAuditLogs Celery task.

    GDPR: IP addresses are anonymised (last octet zeroed for IPv4) by the
    service/view layer BEFORE saving — never stored in full.
    """

    class Outcome(models.TextChoices):
        REQUESTED = "requested", "Requested"
        VERIFIED = "verified", "Verified"
        FAILED = "failed", "Failed"
        EXPIRED = "expired", "Expired"
        EXHAUSTED = "exhausted", "Exhausted"
        RESENT = "resent", "Resent"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="login_audit_logs",
        help_text="Null if email was not found at the time of the event.",
    )

    email = models.EmailField(
        db_index=True,
        help_text="Email address used in the attempt.",
    )

    outcome = models.CharField(
        max_length=16,
        choices=Outcome.choices,
        help_text="Outcome of the login event.",
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text=(
            "Anonymised IP address (last octet zeroed for IPv4). "
            "Anonymisation is applied in the view/service layer before saving."
        ),
    )

    user_agent = models.TextField(
        null=True,
        blank=True,
        help_text="User-Agent string from the request. Optional — collected for security purposes.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp of the event. Indexed for retention cleanup and time-range queries.",
    )

    class Meta:
        app_label = "auth_app"
        verbose_name = "Login Audit Log"
        verbose_name_plural = "Login Audit Logs"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"LoginAuditLog({self.email}, {self.outcome}, {self.created_at})"
