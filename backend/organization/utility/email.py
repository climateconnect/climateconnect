import logging

from django.conf import settings
from mailjet_rest import Client

logger = logging.getLogger(__name__)

mailjet = Client(auth=(settings.MJ_APIKEY_PUBLIC,
                 settings.MJ_APIKEY_PRIVATE), version='v3.1')


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


def send_mention_email(user, project, comment, sender):
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
                "TemplateID": int(settings.PROJECT_COMMENT_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Somebody mentioned you in a comment on the project '"+project.name+"' on Climate Connect",
                "Variables": {
                    "ProjectName": project.name,
                    "CommentText": comment,
                    "FirstName": user.first_name,
                    "CommenterName": sender.first_name + " " + sender.last_name,
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
                "TemplateID": int(settings.PROJECT_COMMENT_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Somebody left a comment on your project '"+project.name+"' on Climate Connect",
                "Variables": {
                    "ProjectName": project.name,
                    "CommentText": comment,
                    "FirstName": user.first_name,
                    "CommenterName": sender.first_name + " " + sender.last_name,
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


def send_project_follower_email(user, project_follower):
    follower_name = project_follower.user.first_name + \
        " " + project_follower.user.last_name
    data = {
        'Messages': [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect Team"
                },
                "To": [
                    {
                        "Email": user.email,
                        "Name": user.first_name + " " + user.last_name
                    }
                ],
                "TemplateID": int(settings.PROJECT_FOLLOWER_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": follower_name + " now follows your project on Climate Connect",
                "Variables": {
                    "FollowerName": follower_name,
                    "FirstName": user.first_name,
                    "ProjectName": project_follower.project.name,
                    "url": settings.FRONTEND_URL + "/projects/" + project_follower.project.url_slug + "?show_followers=true"
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
