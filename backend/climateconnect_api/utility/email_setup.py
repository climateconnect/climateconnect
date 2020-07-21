import sendgrid
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

sg = sendgrid.SendGridAPIClient(
    api_key=settings.SENDGRID_API_KEY
)


def get_user_verification_url(verification_key):
    # TODO: Set expire time for user verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s/activate/%s" % (
        settings.FRONTEND_URL, verification_key_str
    ))

    return url


def send_user_verification_email(user, verification_key):
    url = get_user_verification_url(verification_key)

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
