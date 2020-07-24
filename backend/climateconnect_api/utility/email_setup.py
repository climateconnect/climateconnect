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
    logger.error("template id:"+settings.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID)
    logger.error("frontend url:"+settings.FRONTEND_URL)
    logger.error("support mail:"+settings.CLIMATE_CONNECT_SUPPORT_EMAIL)
    logger.error("sendgrid key:"+settings.SENDGRID_API_KEY)
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s/activate/%s" % (
        settings.FRONTEND_URL, verification_key_str
    ))

    return url

def get_new_email_verification_url(verification_key):
    #TODO: Set expire time for new email verification
    logger.error("template id:"+settings.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID)
    logger.error("frontend url:"+settings.FRONTEND_URL)
    logger.error("support mail:"+settings.CLIMATE_CONNECT_SUPPORT_EMAIL)
    logger.error("sendgrid key:"+settings.SENDGRID_API_KEY)
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s/activate_email/%s" % (
        settings.FRONTEND_URL, verification_key_str
    ))

    return url

def get_reset_password_url(verification_key):
    logger.error("template id:"+settings.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID)
    logger.error("frontend url:"+settings.FRONTEND_URL)
    logger.error("support mail:"+settings.CLIMATE_CONNECT_SUPPORT_EMAIL)
    logger.error("sendgrid key:"+settings.SENDGRID_API_KEY)
    #TODO: Set expire time for new email verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s/reset_password/%s" % (
        settings.FRONTEND_URL, verification_key_str
    ))

    return url


def send_user_verification_email(user, verification_key):
    logger.error("sending email to user "+user.first_name)
    url = get_user_verification_url(verification_key)
    logger.error(url)
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
        mail = sg.client.mail.send.post(request_body=data)
        logger.error(mail)
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))

def send_new_email_verification(user, new_email, verification_key):
    url = get_new_email_verification_url(verification_key)
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
                    "URL": url,
                    "NewMail": new_email
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
        "template_id": settings.SENDGRID_NEW_EMAIL_VERIFICATION_TEMPLATE_ID
    }

    try:
        sg.client.mail.send.post(request_body=data)
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))

def send_password_link(user, password_reset_key):
    url = get_reset_password_url(password_reset_key)
    logger.error("sending link to set new password to "+user.email)
    logger.error(url)
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
                }
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
        "template_id": settings.SENDGRID_RESET_PASSWORD_TEMPLATE_ID
    }

    logger.error("SENDGRID_RESET_PASSWORD_TEMPLATE_ID:"+settings.SENDGRID_RESET_PASSWORD_TEMPLATE_ID)
    try:
        sg.client.mail.send.post(request_body=data)
        logger.error("sent!")
    except Exception as ex:
        logger.error("looking at the errors!")
        logger.error(ex.body)
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))