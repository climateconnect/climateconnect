import logging

from django.conf import settings

from climateconnect_api.utility.email_setup import send_email

logger = logging.getLogger(__name__)


def send_login_code_email_to_user(user, code: str) -> None:
    """
    Send the OTP login code to the user via Mailjet.

    Falls back to a console log when LOGIN_CODE_EMAIL_TEMPLATE_ID is not
    configured (e.g. local development without Mailjet credentials).
    """
    if not getattr(settings, "LOGIN_CODE_EMAIL_TEMPLATE_ID", ""):
        logger.warning(
            f"[LOGIN CODE] No Mailjet template configured. "
            f"OTP for {user.email}: {code}"
        )
        return

    subjects_by_language = {
        "en": "Your Climate Connect login code",
        "de": "Dein Climate Connect Anmeldecode",
    }
    variables = {
        "FirstName": user.first_name,
        "Code": code,
        "ExpiryMinutes": 15,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="LOGIN_CODE_EMAIL_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",  # transactional — no user preference gate
        notification=None,
    )
