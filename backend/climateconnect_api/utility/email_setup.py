from mailjet_rest import Client
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

mailjet = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version='v3.1')


def get_user_verification_url(verification_key):
    # TODO: Set expire time for user verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s/activate/%s" % (
        settings.FRONTEND_URL, verification_key_str
    ))

    return url

def get_new_email_verification_url(verification_key):
    #TODO: Set expire time for new email verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s/activate_email/%s" % (
        settings.FRONTEND_URL, verification_key_str
    ))

    return url

def get_reset_password_url(verification_key):
    #TODO: Set expire time for new email verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s/reset_password/%s" % (
        settings.FRONTEND_URL, verification_key_str
    ))

    return url


def send_user_verification_email(user, verification_key):
    url = get_user_verification_url(verification_key)

    data = {
        'Messages': [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect"
                },
                "To": [
                    {
                        "Email": user.email,
                        "Name": user.first_name + " " + user.last_name
                    }
                ],
                "TemplateID": int(settings.EMAIL_VERIFICATION_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Welcome to Climate Connect!  Verify your email address",
                "Variables": {
                    "FirstName": user.first_name,
                    "url": url
                }
            }
	    ]
    }

    try:
        mail = mailjet.send.create(data=data)
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))
        logger.error(mail)

def send_new_email_verification(user, new_email, verification_key):
    url = get_new_email_verification_url(verification_key)
    data = {
        'Messages': [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect"
                },
                "To": [
                    {
                        "Email": user.email,
                        "Name": user.first_name + " " + user.last_name
                    }
                ],
                "TemplateID": int(settings.NEW_EMAIL_VERIFICATION_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Verify your new email address",
                "Variables": {
                    "FirstName": user.first_name,
                    "url": url,
                    "NewMail": new_email
                }
            }
	    ]
    }

    try:
        mail = mailjet.send.create(data=data)
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))
        logger.error(mail)

def send_password_link(user, password_reset_key):
    url = get_reset_password_url(password_reset_key)
    
    data = {
        'Messages': [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect"
                },
                "To": [
                    {
                        "Email": user.email,
                        "Name": user.first_name + " " + user.last_name
                    }
                ],
                "TemplateID": int(settings.RESET_PASSWORD_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Reset your password",
                "Variables": {
                    "FirstName": user.first_name,
                    "url": url
                }
            }
	    ]
    }

    try:
        mail = mailjet.send.create(data=data)
    except Exception as ex:
        logger.error("looking at the errors!")
        logger.error(ex.body)
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))
        logger.error(mail)

def send_feedback_email(email, message, send_response):

    data = {
        'Messages': [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect"
                },
                "To": [
                    {
                        "Email": "feedback@climateconnect.earth",
                        "Name": "Climate Connect"
                    }
                ],
                "TemplateID": int(settings.FEEDBACK_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Climate Connect User Feedback",
                "Variables": {
                    "text": message,
                    "sendReply": send_response,
                    "email": email
                }
            }
	    ]
    }
    try:
        mail = mailjet.send.create(data=data)
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))
        logger.error(mail)