from datetime import datetime, timedelta
from climateconnect_api.models.notification import EmailNotification
import logging

from typing import List

from django.contrib.auth.models import User
from climateconnect_api.models.user import UserProfile
from organization.models.project import Project
from organization.models.organization import Organization
from ideas.models.ideas import Idea 
from climateconnect_api.utility.translation import (get_user_lang_code,
                                                    get_user_lang_url)
from django.conf import Settings, settings
from mailjet_rest import Client

logger = logging.getLogger(__name__)

mailjet_send_api = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version='v3.1')
mailjet_api = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE))


def get_template_id(template_key, lang_code):
    if not lang_code == "en":
        return getattr(settings, template_key + "_" + lang_code.upper())
    else:
        return getattr(settings, template_key)


def check_send_email_notification(user):
    three_hours_ago = datetime.now() - timedelta(hours=3)
    recent_email_notification = EmailNotification.objects.filter(
        user=user,
        created_at__gte=three_hours_ago
    )
    return not recent_email_notification.exists()


def send_email(
    user,
    variables,
    template_key,
    subjects_by_language,
    should_send_email_setting,
    notification
):
    if not check_send_email_notification(user):
        return
    if should_send_email_setting:
        try:
            user_profile = UserProfile.objects.get(user=user)
            # short circuit if the user has changed his settings to not
            # receive emails on this topic
            if not getattr(user_profile, should_send_email_setting):
                return
        except UserProfile.DoesNotExist:
            print("there is no user profile (send_email)")
    lang_code = get_user_lang_code(user)
    subject = subjects_by_language[lang_code]
    template_id = get_template_id(
        template_key=template_key,
        lang_code=lang_code
    )
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
        if notification:
            EmailNotification.objects.create(
                user=user,
                created_at=datetime.now(),
                notification=notification
            )
        return mail
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (
            send_email.__name__, ex
        ))

def get_user_verification_url(verification_key, lang_url):
    # TODO: Set expire time for user verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s%s/activate/%s" % (
        settings.FRONTEND_URL, lang_url, verification_key_str
    ))

    return url

def get_new_email_verification_url(verification_key, lang_url):
    #TODO: Set expire time for new email verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s%s/activate_email/%s" % (
        settings.FRONTEND_URL, lang_url, verification_key_str
    ))

    return url

def get_reset_password_url(verification_key, lang_url):
    #TODO: Set expire time for new email verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = ("%s%s/reset_password/%s" % (
        settings.FRONTEND_URL, lang_url, verification_key_str
    ))

    return url


def send_user_verification_email(user, verification_key):
    lang_url = get_user_lang_url(get_user_lang_code(user))
    url = get_user_verification_url(verification_key, lang_url)

    subjects_by_language = {
        "en": "Welcome to Climate Connect! Verify your email address",
        "de": "Willkommen bei Climate Connect! Verifiziere deine Email-Adresse!"
    }

    variables =  {
        "FirstName": user.first_name,
        "url": url
    }
    send_email(
        user=user,
        variables=variables,
        template_key="EMAIL_VERIFICATION_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",
        notification=None
    )

def send_new_email_verification(user, new_email, verification_key):
    lang_url = get_user_lang_url(get_user_lang_code(user))
    url = get_new_email_verification_url(verification_key, lang_url)

    subjects_by_language = {
        "en": "Verify your new email address",
        "de": "Bestätige deine neue Email Adresse"
    }

    variables =  {
        "FirstName": user.first_name,
        "url": url,
        "NewMail": new_email
    }
    send_email(
        user=user,
        variables=variables,
        template_key="NEW_EMAIL_VERIFICATION_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",
        notification=None
    )

def send_password_link(user, password_reset_key):
    lang_url = get_user_lang_url(get_user_lang_code(user))
    url = get_reset_password_url(password_reset_key, lang_url)

    subjects_by_language = {
        "en": "Reset your Climate Connect password",
        "de": "Setze deine Climate Connect Passwort zurück"
    }

    variables =  {
        "FirstName": user.first_name,
        "url": url
    }
    send_email(
        user=user,
        variables=variables,
        template_key="RESET_PASSWORD_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",
        notification=None
    )

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
                        "Email": "contact@climateconnect.earth",
                        "Name": "Climate Connect"
                    }
                ],
                "TemplateID": int(settings.FEEDBACK_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Climate Connect User Feedback",
                "Variables": {
                    "text": str(message),
                    "sendReply": str(send_response),
                    "email": str(email if email else "")
                }
            }
        ]
    }
    print(data)

    try:
        mailjet_send_api.send.create(data=data)
    except Exception as ex:
        print("%s: Error sending email: %s" % (
            send_user_verification_email.__name__, ex
        ))

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
        logging.error(contact.status_code)


def remove_contact_from_list(contact_id, list_id):
    data = {
        'ContactsLists': [
            {
                'Action': "remove",
                'ListID': list_id
            }
        ]
    }
    mailjet_api.contact_managecontactslists.create(id=contact_id, data=data)


def send_weekly_personalized_recommendations_email2(user: User, projects: Project, organization: Organization = None, idea: Idea = None): # user_notifications: List[UserNotification]

    template_key = "WEEKLY_RECOMMENDATIONS_EMAIL"

    lang_code = get_user_lang_code(user)
    
    subjects_by_language = {
        "en": f"You have new recommendations",
        "de": f"Du hast neue Empfehlungen"
    }
    subject = subjects_by_language.get(lang_code, "en")
    
    template_id = get_template_id(
        template_key=template_key,
        lang_code=lang_code
    )

    # make sure to set right path to the production backend storage server 
    image_url = settings.ALLOWED_HOSTS[6] + projects.thumbnail_image.url 

    # add language part
    project_url = settings.FRONTEND_URL + "/projects/" + projects.url_slug
 
    #mailjet_entities = create_mailjet_variables(entities)

    variables =  {
        "FirstName": user.first_name,
        "project_name": projects.name,
        "creator": "Niemand",
        "location": "",
        "imageUrl": image_url,
        "projectUrl": project_url,
        "numberOfEntities": 1,
        "htmlpart": "<div style='padding:0px 25px;'><p> laksjdlfkajlskdfjlaksdf</p></div>",
    }


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
                    "Email": "philipp.ernstberger@climateconnect.earth",
                    "Name": "Philipp Ernstberger"
                }
            }
        ]
    }


    try:
        mail = mailjet_send_api.send.create(data=data)
    except Exception as ex:
        logger.error(f"EmailFailure: Exception sending email -> {ex}")

    if mail.status_code != 200:
        logger.error(f"EmailFailure: Error sending email -> {mail.text}")


def create_variables_for_weekly_recommendations(project_ids: List = [], organization_ids: List = [], idea_ids: List = []):
    # edit the image and url path for production
    # todo idea has no url 
    # entity_template = {
    #     "type": '',
    #     "name": '',
    #     "imageUrl": '',
    #     "url": '',
    #     "creator": '',
    #     "location": '',
    #     "tags": '',
    # }
    main_page = 'https://climateconnect.earth/en/browse'

    entities = []
    for project_id in project_ids:
        project = Project.objects.select_related('loc').get(id=project_id)
        project_template = {}
        project_template['type'] = "Project"
        project_template['name'] = project.name
        project_template['imageUrl'] = settings.ALLOWED_HOSTS[6] + project.thumbnail_image.url if project.thumbnail_image else ''
        project_template['url'] = settings.FRONTEND_URL + "/projects/" + project.url_slug if project.url_slug else main_page
        project_template['creator'] = ''
        project_template['location'] = project.loc.name if project.loc else ''
        project_template['tags'] = ''
        entities.append(project_template)
    for organization_id in organization_ids:
        orga = Organization.objects.select_related('location').get(id=organization_id)
        orga_template = {}
        orga_template['type'] = "Organization"
        orga_template['name'] = orga.name
        orga_template['imageUrl'] = settings.ALLOWED_HOSTS[6] + orga.thumbnail_image.url if orga.thumbnail_image else ''
        orga_template['url'] = settings.FRONTEND_URL + "/organizations/" + orga.url_slug if orga.url_slug else main_page
        orga_template['creator'] = ''
        orga_template['location'] = orga.location.name if orga.location else ''
        orga_template['tags'] = ''
        entities.append(orga_template)
    for idea_id in idea_ids:
        idea = Idea.objects.select_related('location', 'user').get(id=idea_id)
        idea_template = {}
        idea_template['type'] = "Idea"
        idea_template['name'] = idea.name
        idea_template['imageUrl'] = settings.ALLOWED_HOSTS[6] + idea.thumbnail_image.url if idea.thumbnail_image else ''
        idea_template['url'] = ''#settings.FRONTEND_URL + "/idea/" + idea.url_slug if idea.url_slug else main_page
        idea_template['creator'] = idea.user.first_name + " " + idea.user.last_name if idea.user else ''
        idea_template['location'] = idea.location.name if idea.location else ''
        idea_template['tags'] = ''
        entities.append(idea_template)
    return entities


def send_weekly_personalized_recommendations_email(user: User, project_ids: List = [], organization_ids: List = [], idea_ids: List = []):

    entities = create_variables_for_weekly_recommendations(project_ids, organization_ids, idea_ids) 

    template_key = "WEEKLY_RECOMMENDATIONS_EMAIL"

    lang_code = get_user_lang_code(user)
    
    # subjects_by_language = {
    #     "en": f"You have new recommendations",
    #     "de": f"Du hast neue Empfehlungen"
    # }
    # subject = subjects_by_language.get(lang_code, "en")
    
    template_id = get_template_id(
        template_key=template_key,
        lang_code=lang_code
    )

    variables =  {
        "FirstName": user.first_name,
        "Entities": entities,
    }

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
                "TemplateErrorReporting": {
                    "Email": "philipp.ernstberger@climateconnect.earth",
                    "Name": "Philipp Ernstberger"
                }
            }
        ]
    }


    try:
        mail = mailjet_send_api.send.create(data=data)
    except Exception as ex:
        logger.error(f"EmailFailure: Exception sending email -> {ex}")

    if mail.status_code != 200:
        logger.error(f"EmailFailure: Error sending email -> {mail.text}")

    return mail