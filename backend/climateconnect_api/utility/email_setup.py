from climateconnect_api.models.user import UserProfile
from mailjet_rest import Client
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

mailjet_send_api = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version='v3.1')
mailjet_api = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE))

def get_template_id(template_key, user, lang_code):
    if not lang_code:
        try:
            user_profile = UserProfile.objects.get(user=user)    
            lang_code = user_profile.language.language_code    
        except UserProfile.DoesNotExist:
            print("there is no user profile!")

    if not lang_code == "en":
        return getattr(settings, template_key + "_" + lang_code.upper())
    else:
        return getattr(settings, template_key)

def send_email(user, variables, template_id, subject):
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
                "TemplateID": int(template_id),
                "TemplateLanguage": True,                
                "Variables": variables,
                "Subject": subject,
                "TemplateErrorReporting": {
                    "Email": "christoph.stoll@climateconnect.earth",
                    "Name": "Christoph Stoll"
                }
            }
        ]
    }

    try:
        mail = mailjet_send_api.send.create(data=data)
        return mail
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_email.__name__, ex
        ))

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
        mail = mailjet_send_api.send.create(data=data)
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
        mail = mailjet_send_api.send.create(data=data)
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
        mail = mailjet_send_api.send.create(data=data)
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
        mail = mailjet_send_api.send.create(data=data)
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))
        logger.error(mail)

def register_newsletter_contact(email_address):
    old_contact = mailjet_api.contact.get(email_address)
    if old_contact.status_code == 404:
        contact_id = create_contact(email_address)
    if old_contact.status_code == 200:
        result = old_contact.json()
        contact_id = result['Data'][0]['ID']
    add_contact_to_list(contact_id, settings.MAILJET_NEWSLETTER_LIST_ID)

def create_contact(email_address):
    data = {
        'IsExcludedFromCampaigns': "true",
        'Email': email_address
    }
    new_contact = mailjet_api.contact.create(data=data)
    result = new_contact.json()
    return result['Data'][0]['ID']

def add_contact_to_list(contact_id, list_id):
    data = {
        'ContactID': contact_id,
        'ListID': list_id
    }
    result = mailjet_api.listrecipient.create(data=data)
    if not result.status_code == 201:
        logger.error(result.status_code)
        logger.error("Could not add contact "+str(contact_id)+" to list "+str(list_id))
    return True

def unregister_newsletter_contact(email_address):
    contact = mailjet_api.contact.get(email_address)
    if contact.status_code == 200:
        result = contact.json()
        contact_id = result['Data'][0]['ID']
        remove_contact_from_list(contact_id, settings.MAILJET_NEWSLETTER_LIST_ID)
    else:
        print(contact.status_code)


def remove_contact_from_list(contact_id, list_id):
    data = {
        'ContactsLists': [
            {
                'Action': "remove",
                'ListID': list_id
            }
        ]
    }
    result = mailjet_api.contact_managecontactslists.create(id=contact_id, data=data)