from mailjet_rest import Client
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

mailjet = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version='v3.1')

def send_private_chat_message_notification_email(user, message_content, chat_uuid, sender_name):
    chat_url = settings.FRONTEND_URL +  "/chat/" + str(chat_uuid)
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
                "TemplateID": int(settings.PRIVATE_MESSAGE_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "You received a private message on Climate Connect",
                "Variables": {
                    "FirstName": user.first_name,
                    "SenderName": sender_name,
                    "Message": message_content,
                    "url": chat_url,
                }
            }
        ]
    }
    try:
        mail = mailjet.send.create(data=data)
        return mail
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_private_chat_message_notification_email.__name__, ex
        ))
        logger.error(ex)
def send_group_chat_message_notification_email(user, message_content, chat_uuid, sender_name, chat_title):
    chat_url = settings.FRONTEND_URL +  "/chat/" + str(chat_uuid)
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
                "TemplateID": int(settings.GROUP_MESSAGE_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "You received a message in the group '"+chat_title+"' on Climate Connect",
                "Variables": {
                    "FirstName": user.first_name,
                    "SenderName": sender_name,
                    "GroupName": chat_title,
                    "Message": message_content,
                    "url": chat_url,
                }
            }
        ]
    }

    try:
        mail = mailjet.send.create(data=data)
        return mail
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_group_chat_message_notification_email.__name__, ex
        ))
        logger.error(ex)