from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from auth_app.models import LoginAuditLog, LoginToken
from auth_app.tasks import cleanup_login_audit_logs, cleanup_login_tokens


def make_user(email="test@example.com"):
    return User.objects.create_user(username=email, email=email, password="pw")


class LoginTokenModelTest(TestCase):
    def test_str(self):
        token = LoginToken(
            email="a@b.com",
            token_hash="hash",
            session_key="key",
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        self.assertIn("a@b.com", str(token))

    def test_uuid_pk(self):
        token = LoginToken.objects.create(
            email="a@b.com",
            token_hash="hash",
            session_key="uniquekey1",
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        self.assertIsNotNone(token.id)
        import uuid

        uuid.UUID(str(token.id))  # raises ValueError if not valid UUID

    def test_session_key_unique(self):
        now = timezone.now() + timedelta(minutes=15)
        LoginToken.objects.create(
            email="a@b.com", token_hash="h", session_key="same_key", expires_at=now
        )
        from django.db import IntegrityError

        with self.assertRaises(IntegrityError):
            LoginToken.objects.create(
                email="b@b.com", token_hash="h2", session_key="same_key", expires_at=now
            )

    def test_attempt_count_default(self):
        token = LoginToken.objects.create(
            email="a@b.com",
            token_hash="hash",
            session_key="key2",
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        self.assertEqual(token.attempt_count, 0)

    def test_used_at_nullable(self):
        token = LoginToken.objects.create(
            email="a@b.com",
            token_hash="hash",
            session_key="key3",
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        self.assertIsNone(token.used_at)


class LoginAuditLogModelTest(TestCase):
    def test_str(self):
        log = LoginAuditLog(
            email="a@b.com",
            outcome=LoginAuditLog.Outcome.REQUESTED,
        )
        self.assertIn("a@b.com", str(log))

    def test_outcome_choices(self):
        valid_outcomes = {c.value for c in LoginAuditLog.Outcome}
        self.assertEqual(
            valid_outcomes,
            {"requested", "verified", "failed", "expired", "exhausted", "resent"},
        )

    def test_create_append_only(self):
        log = LoginAuditLog.objects.create(
            email="a@b.com",
            outcome=LoginAuditLog.Outcome.VERIFIED,
        )
        self.assertIsNotNone(log.id)
        # Confirm no rows were mutated (basic smoke test)
        self.assertEqual(LoginAuditLog.objects.count(), 1)


class UserProfileAuthMethodTest(TestCase):
    def test_default_auth_method_is_password(self):
        from climateconnect_api.models import UserProfile

        user = make_user("new@example.com")
        profile = UserProfile.objects.create(user=user)
        self.assertEqual(profile.auth_method, "password")

    def test_auth_method_otp(self):
        from climateconnect_api.models import UserProfile

        user = make_user("otp@example.com")
        profile = UserProfile.objects.create(user=user, auth_method="otp")
        profile.refresh_from_db()
        self.assertEqual(profile.auth_method, "otp")


class CleanupLoginTokensTaskTest(TestCase):
    def _make_token(self, session_key, used_at=None, expires_at=None):
        return LoginToken.objects.create(
            email="a@b.com",
            token_hash="hash",
            session_key=session_key,
            expires_at=expires_at or timezone.now() + timedelta(minutes=15),
            used_at=used_at,
        )

    def test_deletes_used_tokens_older_than_24h(self):
        old_used = timezone.now() - timedelta(hours=25)
        self._make_token("key_used_old", used_at=old_used)
        result = cleanup_login_tokens()
        self.assertEqual(result["deleted_used"], 1)
        self.assertEqual(LoginToken.objects.count(), 0)

    def test_keeps_recently_used_tokens(self):
        recent_used = timezone.now() - timedelta(hours=1)
        self._make_token("key_used_recent", used_at=recent_used)
        result = cleanup_login_tokens()
        self.assertEqual(result["deleted_used"], 0)
        self.assertEqual(LoginToken.objects.count(), 1)

    def test_deletes_unused_expired_tokens(self):
        old_expiry = timezone.now() - timedelta(hours=2)
        self._make_token("key_expired", expires_at=old_expiry)
        result = cleanup_login_tokens()
        self.assertEqual(result["deleted_expired"], 1)
        self.assertEqual(LoginToken.objects.count(), 0)

    def test_keeps_active_unused_tokens(self):
        self._make_token("key_active")  # expires in 15 min
        result = cleanup_login_tokens()
        self.assertEqual(result["deleted_expired"], 0)
        self.assertEqual(LoginToken.objects.count(), 1)


class CleanupLoginAuditLogsTaskTest(TestCase):
    def test_deletes_old_logs(self):
        old = timezone.now() - timedelta(days=91)
        log = LoginAuditLog.objects.create(
            email="a@b.com", outcome=LoginAuditLog.Outcome.REQUESTED
        )
        # Force-set created_at by using update() to bypass auto_now_add
        LoginAuditLog.objects.filter(pk=log.pk).update(created_at=old)

        result = cleanup_login_audit_logs()
        self.assertEqual(result["deleted"], 1)
        self.assertEqual(LoginAuditLog.objects.count(), 0)

    def test_keeps_recent_logs(self):
        LoginAuditLog.objects.create(
            email="a@b.com", outcome=LoginAuditLog.Outcome.REQUESTED
        )
        result = cleanup_login_audit_logs()
        self.assertEqual(result["deleted"], 0)
        self.assertEqual(LoginAuditLog.objects.count(), 1)
