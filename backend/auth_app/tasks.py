from django.utils import timezone
from datetime import timedelta

from climateconnect_main.celery import app


@app.task
def cleanup_login_tokens():
    """
    Delete stale LoginToken rows to keep the table small.

    Deletes:
    - Used tokens where used_at is older than 24 hours.
    - Unused tokens where expires_at is more than 1 hour in the past.

    Runs every 30 minutes via Celery Beat.
    """
    from auth_app.models import LoginToken

    now = timezone.now()

    used_cutoff = now - timedelta(hours=24)
    expired_cutoff = now - timedelta(hours=1)

    deleted_used, _ = LoginToken.objects.filter(
        used_at__isnull=False,
        used_at__lt=used_cutoff,
    ).delete()

    deleted_expired, _ = LoginToken.objects.filter(
        used_at__isnull=True,
        expires_at__lt=expired_cutoff,
    ).delete()

    return {
        "deleted_used": deleted_used,
        "deleted_expired": deleted_expired,
    }


@app.task
def cleanup_login_audit_logs():
    """
    Purge LoginAuditLog entries older than 90 days.

    Runs once daily via Celery Beat (at 03:00 UTC).
    """
    from auth_app.models import LoginAuditLog

    cutoff = timezone.now() - timedelta(days=90)
    deleted, _ = LoginAuditLog.objects.filter(created_at__lt=cutoff).delete()
    return {"deleted": deleted}
