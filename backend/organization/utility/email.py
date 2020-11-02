from mailjet_rest import Client
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

mailjet = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version='v3.1')

def send_project_comment_reply_email(user, project, comment, sender):
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
                "TemplateID": int(settings.PROJECT_COMMENT_REPLY_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Someone replied to your comment on Climate Connect",
                "Variables": {
                    "FirstName": user.first_name,
                    "CommenterName": sender.first_name + " " + sender.last_name,
                    "CommentText": comment,
                    "url": settings.FRONTEND_URL+"/projects/"+project.url_slug+"#comments",
                    "ProjectName": project.name
                }
            }
        ]
    }

    try:
        mail = mailjet.send.create(data=data)
        return mail
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_project_comment_reply_email.__name__, ex
        ))
def send_project_comment_email(user, project, comment, sender):
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
                "TemplateID": 1836766,
                "TemplateLanguage": True,
                "Subject": "Somebody left a comment on your project '"+project.name+"' on Climate Connect",
                "Variables": {
                    "CommentText": comment,
                    "FirstName": user.first_name,
                    "CommenterName": sender.first_name + " " + sender.last_name,
                    "ProjectName": project.name,
                    "url": settings.FRONTEND_URL+"/projects/"+project.url_slug+"#comments"
                }
            }
        ]
    }

    try:
        mail = mailjet.send.create(data=data)
        return mail
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_project_comment_email.__name__, ex
        ))