import sendgrid
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

sg = sendgrid.SendGridAPIClient(
    api_key=settings.SENDGRID_API_KEY
)


def get_user_verification_url(user):
    # Set expire time 4 hours for user verification
    expires = timezone.now() + timedelta(hours=4)
    expire_url_string = (
        expires.isoformat()
        .replace("+", "%2B")
        .replace("-", "%2D")
    )

    url = ("%s/user/activate?id=%s&expires=%s" % (
        settings.FRONTEND_URL, user.id, expire_url_string
    ))

    return url


def send_user_verification_email(user):
    url = get_user_verification_url(user)

    data = {
        "personalizations": [
            {
                "to": [
                    {
                        "email": user.email
                    }
                ],
                "dynamic_template_data": {
                    "FirstName": user.first_name,
                    "URL": url
                },
            },
        ],
        "from": {
            "email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL
        },
        "content": [
            {
                "type": "text/html",
                "value": " "
            }
        ],
        "template_id": settings.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID
    }

    try:
        sg.client.mail.send.post(request_body=data)
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))
