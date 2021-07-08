from climateconnect_api.models.user import UserProfile
from climateconnect_api.utility.translation import get_user_lang_code, get_user_lang_url
from climateconnect_api.utility.email_setup import get_template_id, send_email
from django.conf import settings

def send_idea_join_email(user, joining_user, idea, chat_uuid):    
    try:
        user_profile = UserProfile.objects.get(user=user)
        # short circuit if the user has changed his settings to not receive emails on idea join
        if user_profile.email_on_idea_join == False:
            return
    except UserProfile.DoesNotExist:
        print("there is no user profile (send_idea_join_email")
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "{} joined your idea on Climate Connect".format(joining_user.first_name + " " + joining_user.last_name),
        "de": "{} macht jetzt bei deiner Idee auf Climate Connect mit!".format(joining_user.first_name + " " + joining_user.last_name)
    }
    subject = subjects_by_language[lang_code]
    base_url = settings.FRONTEND_URL
    url_ending = "/chat/"+str(chat_uuid)
    variables = {
        "FirstName": user.first_name,
        "JoiningUserFirstName": joining_user.first_name,
        "JoiningUserName": joining_user.first_name + " " + joining_user.last_name,
        "ChatUrl": base_url + get_user_lang_url(lang_code) + url_ending,
        "IdeaName": idea.name
    }
    template_id = get_template_id(template_key="JOINED_IDEA_TEMPLATE", user=user, lang_code=lang_code)
    send_email(
        user=user, 
        variables=variables, 
        template_id=template_id, 
        subject=subject
    )