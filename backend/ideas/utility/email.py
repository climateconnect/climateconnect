from climateconnect_api.utility.translation import get_user_lang_code, get_user_lang_url
from climateconnect_api.utility.email_setup import send_email
from django.conf import settings


def send_idea_join_email(user, joining_user, idea, chat_uuid, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "{} joined your idea on Climate Connect".format(
            joining_user.first_name + " " + joining_user.last_name
        ),
        "de": "{} macht jetzt bei deiner Idee auf Climate Connect mit!".format(
            joining_user.first_name + " " + joining_user.last_name
        ),
    }
    base_url = settings.FRONTEND_URL
    url_ending = "/chat/" + str(chat_uuid)
    variables = {
        "FirstName": user.first_name,
        "JoiningUserFirstName": joining_user.first_name,
        "JoiningUserName": joining_user.first_name + " " + joining_user.last_name,
        "ChatUrl": base_url + get_user_lang_url(lang_code) + url_ending,
        "IdeaName": idea.name,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="JOINED_IDEA_TEMPLATE",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_idea_join",
        notification=notification,
    )
