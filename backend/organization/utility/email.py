from climateconnect_api.utility.translation import get_user_lang_code, get_user_lang_url
from climateconnect_api.utility.email_setup import get_template_id, send_email
from climateconnect_api.models.user import UserProfile
from mailjet_rest import Client
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

mailjet = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version='v3.1')

def send_project_comment_reply_email(user, project, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Someone replied to your comment on Climate Connect",
        "de": "Jemand hat auf deinen Kommentar auf Climate Connect geantwortet"
    }
    base_url = settings.FRONTEND_URL
    url_ending = "/projects/"+project.url_slug+"#comments"
    variables = {
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "CommentText": comment,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
        "ProjectName": project.name
    }
    send_email(
        user=user,
        variables=variables,
        template_key="PROJECT_COMMENT_REPLY_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_reply_to_your_comment",
        notification=notification
    )

def send_project_comment_email(user, project, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Somebody left a comment on your project {} on Climate Connect".format(project.name),
        "de": "Jemand hat dein Projekt {} auf Climate Connect kommentiert".format(project.name)
    }
    base_url = settings.FRONTEND_URL
    url_ending = "/projects/"+project.url_slug+"#comments"
    variables = {
        "ProjectName": project.name,
        "CommentText": comment,
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending
    }
    send_email(
        user=user, 
        variables=variables, 
        template_key="PROJECT_COMMENT_TEMPLATE_ID", 
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_comment_on_your_project",
        notification=notification
    )

def send_idea_comment_email(user, idea, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Somebody left a comment on your idea '{}' on Climate Connect".format(idea.name),
        "de": "Jemand hat einen Kommentar zu deiner Idee '{}' auf Climate Connect hinterlassen.".format(idea.name)
    }
    base_url = settings.FRONTEND_URL
    url_ending = "/hubs/" + idea.hub_shared_in.url_slug + "?idea=" + idea.url_slug + "#ideas"

    
    variables = {
        "IdeaName": idea.name,
        "CommentText": comment,
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending
    }
    send_email(
        user=user, 
        variables=variables, 
        template_key="IDEA_COMMENT_TEMPLATE_ID", 
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_comment_on_your_idea",
        notification=notification
    )

def send_idea_comment_reply_email(user, idea, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Someone replied to your comment on Climate Connect",
        "de": "Jemand hat auf deinen Kommentar auf Climate Connect geantwortet."
    }

    base_url = settings.FRONTEND_URL
    url_ending = "/hubs/" + idea.hub_shared_in.url_slug + "?idea=" + idea.url_slug + "#ideas"   

    variables = {
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "CommentText": comment,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
        "IdeaName": idea.name
    }
    send_email(
        user=user, 
        variables=variables, 
        template_key="IDEA_COMMENT_REPLY_TEMPLATE_ID", 
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_reply_to_your_comment",
        notification=notification
    )

def send_project_follower_email(user, project_follower, notification):
    lang_code = get_user_lang_code(user)
    follower_name = project_follower.user.first_name + " " + project_follower.user.last_name
    subjects_by_language = {
        "en": "{} now follows your project on Climate Connect".format(follower_name),
        "de": "{} folgt jetzt deinem Projekt auf Climate Connect".format(follower_name)
    }

    base_url = settings.FRONTEND_URL
    url_ending = "/projects/" + project_follower.project.url_slug + "?show_followers=true"

    variables = {
        "FollowerName": follower_name,
        "FirstName": user.first_name,
        "ProjectName": project_follower.project.name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending
    }
    send_email(
        user=user, 
        variables=variables, 
        template_key="PROJECT_FOLLOWER_TEMPLATE_ID", 
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_new_project_follower",
        notification=notification
    )