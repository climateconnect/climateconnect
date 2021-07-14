from climateconnect_api.utility.translation import get_user_lang_code, get_user_lang_url
from climateconnect_api.utility.email_setup import get_template_id, send_email
from climateconnect_api.models.user import UserProfile
from mailjet_rest import Client
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

mailjet = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version='v3.1')

def send_project_comment_reply_email(user, project, comment, sender):
    subject = "Someone replied to your comment on Climate Connect"
    variables = {
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "CommentText": comment,
        "url": settings.FRONTEND_URL+"/projects/"+project.url_slug+"#comments",
        "ProjectName": project.name
    }
    template_id = settings.PROJECT_COMMENT_REPLY_TEMPLATE_ID
    send_email(user=user, variables=variables, template_id=template_id, subject=subject)

def send_project_comment_email(user, project, comment, sender):
    subject = "Somebody left a comment on your project '"+project.name+"' on Climate Connect"
    variables = {
        "ProjectName": project.name,
        "CommentText": comment,
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "url": settings.FRONTEND_URL+"/projects/"+project.url_slug+"#comments"
    }
    template_id = settings.PROJECT_COMMENT_TEMPLATE_ID
    send_email(user=user, variables=variables, template_id=template_id, subject=subject)

def send_idea_comment_email(user, idea, comment, sender):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Somebody left a comment on your idea '"+idea.name+"' on Climate Connect",
        "de": "Jemand hat einen Kommentar zu deiner Idee '"+idea.name+"' auf Climate Connect hinterlassen."
    }
    subject = subjects_by_language[lang_code]
    base_url = settings.FRONTEND_URL
    url_ending = "/hubs/" + idea.hub_shared_in.url_slug + "?idea=" + idea.url_slug + "#ideas"

    template_id = get_template_id(template_key="IDEA_COMMENT_TEMPLATE_ID", user=user, lang_code=lang_code)
    
    variables = {
        "IdeaName": idea.name,
        "CommentText": comment,
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending
    }
    send_email(user=user, variables=variables, template_id=template_id, subject=subject)

def send_idea_comment_reply_email(user, idea, comment, sender):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Someone replied to your comment on Climate Connect",
        "de": "Jemand hat auf deinen Kommentar auf Climate Connect geantwortet."
    }
    subject = subjects_by_language[lang_code]

    base_url = settings.FRONTEND_URL
    url_ending = "/hubs/" + idea.hub_shared_in.url_slug + "?idea=" + idea.url_slug + "#ideas"   

    template_id = get_template_id(template_key="IDEA_COMMENT_REPLY_TEMPLATE_ID", user=user, lang_code=lang_code)
    
    variables = {
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "CommentText": comment,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
        "IdeaName": idea.name
    }
    send_email(user=user, variables=variables, template_id=template_id, subject=subject)

def send_project_follower_email(user, project_follower):
    follower_name = project_follower.user.first_name + " " + project_follower.user.last_name
    subject = follower_name + " now follows your project on Climate Connect"
    variables = {
        "FollowerName": follower_name,
        "FirstName": user.first_name,
        "ProjectName": project_follower.project.name,
        "url": settings.FRONTEND_URL + "/projects/" + project_follower.project.url_slug + "?show_followers=true"
    }
    template_id = settings.PROJECT_FOLLOWER_TEMPLATE_ID
    send_email(user=user, variables=variables, template_id=template_id, subject=subject)