import logging
from datetime import datetime, timedelta
from typing import List

from django.contrib.auth.models import User
from organization.models.project import Project
from organization.models.organization import Organization
from organization.models.members import OrganizationMember
from ideas.models.ideas import Idea
from organization.serializers.project import ProjectStubSerializer
from organization.serializers.organization import OrganizationCardSerializer
from ideas.serializers.idea import IdeaSerializer
from django.conf import settings
from climateconnect_api.models import UserProfile
from climateconnect_api.models.notification import EmailNotification, UserNotification
from climateconnect_api.utility.translation import get_user_lang_code, get_user_lang_url
from mailjet_rest import Client

logger = logging.getLogger(__name__)

mailjet_send_api = Client(
    auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version="v3.1"
)
mailjet_api = Client(auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE))


def get_template_id(template_key, lang_code):
    if not lang_code == "en":
        return getattr(settings, template_key + "_" + lang_code.upper())
    else:
        return getattr(settings, template_key)


def check_send_email_notification(user):
    three_hours_ago = datetime.now() - timedelta(hours=3)
    recent_email_notification = EmailNotification.objects.filter(
        user=user, created_at__gte=three_hours_ago
    )
    return not recent_email_notification.exists()


def send_email(
    user,
    variables,
    template_key,
    subjects_by_language,
    should_send_email_setting,
    notification,
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
    template_id = get_template_id(template_key=template_key, lang_code=lang_code)
    data = {
        "Messages": [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect",
                },
                "To": [
                    {
                        "Email": user.email,
                        "Name": user.first_name + " " + user.last_name,
                    }
                ],
                "TemplateID": int(template_id),
                "TemplateLanguage": True,
                "Variables": variables,
                "Subject": subject,
                "TemplateErrorReporting": {
                    "Email": settings.MAILJET_ADMIN_EMAIL,
                    "Name": "Mailjet Admin",
                },
            }
        ]
    }

    try:
        mail = mailjet_send_api.send.create(data=data)
        if notification:
            EmailNotification.objects.create(
                user=user, created_at=datetime.now(), notification=notification
            )
        return mail
    except Exception as ex:
        logger.error("%s: Error sending email: %s" % (send_email.__name__, ex))


def get_user_verification_url(verification_key, lang_url):
    # TODO: Set expire time for user verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = "%s%s/activate/%s" % (settings.FRONTEND_URL, lang_url, verification_key_str)

    return url


def get_new_email_verification_url(verification_key, lang_url):
    # TODO: Set expire time for new email verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = "%s%s/activate_email/%s" % (
        settings.FRONTEND_URL,
        lang_url,
        verification_key_str,
    )

    return url


def get_reset_password_url(verification_key, lang_url):
    # TODO: Set expire time for new email verification
    verification_key_str = str(verification_key).replace("-", "%2D")
    url = "%s%s/reset_password/%s" % (
        settings.FRONTEND_URL,
        lang_url,
        verification_key_str,
    )

    return url


def send_user_verification_email(user, verification_key):
    lang_url = get_user_lang_url(get_user_lang_code(user))
    url = get_user_verification_url(verification_key, lang_url)

    subjects_by_language = {
        "en": "Welcome to Climate Connect! Verify your email address",
        "de": "Willkommen bei Climate Connect! Verifiziere deine Email-Adresse!",
    }

    variables = {"FirstName": user.first_name, "url": url}
    send_email(
        user=user,
        variables=variables,
        template_key="EMAIL_VERIFICATION_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",
        notification=None,
    )


def send_new_email_verification(user, new_email, verification_key):
    lang_url = get_user_lang_url(get_user_lang_code(user))
    url = get_new_email_verification_url(verification_key, lang_url)

    subjects_by_language = {
        "en": "Verify your new email address",
        "de": "Bestätige deine neue E-Mail Adresse",
    }

    variables = {"FirstName": user.first_name, "url": url, "NewMail": new_email}
    send_email(
        user=user,
        variables=variables,
        template_key="NEW_EMAIL_VERIFICATION_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",
        notification=None,
    )


def send_password_link(user, password_reset_key):
    lang_url = get_user_lang_url(get_user_lang_code(user))
    url = get_reset_password_url(password_reset_key, lang_url)

    subjects_by_language = {
        "en": "Reset your Climate Connect password",
        "de": "Setze deine Climate Connect Passwort zurück",
    }

    variables = {"FirstName": user.first_name, "url": url}
    send_email(
        user=user,
        variables=variables,
        template_key="RESET_PASSWORD_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",
        notification=None,
    )


def send_feedback_email(email, message, send_response):
    data = {
        "Messages": [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect",
                },
                "To": [
                    {"Email": "contact@climateconnect.earth", "Name": "Climate Connect"}
                ],
                "TemplateID": int(settings.FEEDBACK_TEMPLATE_ID),
                "TemplateLanguage": True,
                "Subject": "Climate Connect User Feedback",
                "Variables": {
                    "text": str(message),
                    "sendReply": str(send_response),
                    "email": str(email if email else ""),
                },
            }
        ]
    }
    print(data)

    try:
        mailjet_send_api.send.create(data=data)
    except Exception as ex:
        print(
            "%s: Error sending email: %s" % (send_user_verification_email.__name__, ex)
        )


def register_newsletter_contact(email_address):
    old_contact = mailjet_api.contact.get(email_address)
    if old_contact.status_code == 404:
        contact_id = create_contact(email_address)
    if old_contact.status_code == 200:
        result = old_contact.json()
        contact_id = result["Data"][0]["ID"]
    add_contact_to_list(contact_id, settings.MAILJET_NEWSLETTER_LIST_ID)


def create_contact(email_address):
    data = {"IsExcludedFromCampaigns": "true", "Email": email_address}
    new_contact = mailjet_api.contact.create(data=data)
    result = new_contact.json()
    return result["Data"][0]["ID"]


def add_contact_to_list(contact_id, list_id):
    data = {"ContactID": contact_id, "ListID": list_id}
    result = mailjet_api.listrecipient.create(data=data)
    if not result.status_code == 201:
        logger.error(result.status_code)
        logger.error(
            "Could not add contact " + str(contact_id) + " to list " + str(list_id)
        )
    return True


def unregister_newsletter_contact(email_address):
    contact = mailjet_api.contact.get(email_address)
    if contact.status_code == 200:
        result = contact.json()
        contact_id = result["Data"][0]["ID"]
        remove_contact_from_list(contact_id, settings.MAILJET_NEWSLETTER_LIST_ID)
    else:
        logging.error(contact.status_code)


def remove_contact_from_list(contact_id, list_id):
    data = {"ContactsLists": [{"Action": "remove", "ListID": list_id}]}
    mailjet_api.contact_managecontactslists.create(id=contact_id, data=data)


def create_global_variables_for_weekly_recommendations(
    entity_ids: dict,
    lang_code: str, 
    is_in_hub: bool = False,
):
    content = []

    projects = Project.objects.filter(id__in=entity_ids["project"])
    project_serializer = ProjectStubSerializer(projects, many=True, context={"language_code": lang_code})

    for entity in project_serializer.data:
        content.append(generate_project_mailjet_vars(entity, is_in_hub))

    organizations = Organization.objects.filter(id__in=entity_ids["organization"])
    org_serializer = OrganizationCardSerializer(organizations, many=True, context={'language_code': lang_code})
    for entity in org_serializer.data:
        content.append(generate_org_mailjet_vars(entity, is_in_hub))

    ideas = Idea.objects.filter(id__in=entity_ids["idea"])
    idea_serializer = IdeaSerializer(ideas, many=True, context={'language_code': lang_code})
    for entity in idea_serializer.data:
        content.append(generate_idea_mailjet_vars(entity))

    return content
    
def generate_project_mailjet_vars(entity : dict, is_in_hub : bool):
    main_page = "https://climateconnect.earth"
    url = (settings.FRONTEND_URL + "/projects/" + entity["url_slug"]) if entity["url_slug"] else main_page
    image_url = (settings.BACKEND_URL + entity["image"]) if entity["image"] else ""
    location = entity["location"] if not is_in_hub else ""
    for parent in entity["project_parents"]:
        if parent["parent_organization"]:
            creator = parent["parent_organization"]["name"]
            if parent["parent_organization"]["thumbnail_image"]:
                creator_image =  settings.BACKEND_URL + parent["parent_organization"]["thumbnail_image"]
            else:
                creator_image = ""
        elif parent["parent_user"]:
            creator = parent["parent_user"]["first_name"] + " " + parent["parent_user"]["last_name"]
            if parent["parent_user"]["thumbnail_image"]:
                creator_image =  settings.BACKEND_URL + parent["parent_user"]["thumbnail_image"]
            else:
                creator_image = ""
        else:
            creator =""
            creator_image = ""
    if entity["tags"]:
        category = entity["tags"][0]["project_tag"]["name"]
    else:
        category = ""
    
    card = generate_project_card(
        entity["name"],
        url,
        image_url,
        location,
        creator,
        creator_image,
        category,
    )
    return {
            "card": card,
            "shortDescription": entity["short_description"],
            "url": url,
            "type": "organization",
        }

def generate_org_mailjet_vars(entity: dict, is_in_hub: bool):
    main_page = "https://climateconnect.earth"
    url = (settings.FRONTEND_URL + "/organizations/" + entity["url_slug"]) if entity["url_slug"] else main_page
    image_url = (settings.BACKEND_URL + entity["thumbnail_image"]) if entity["thumbnail_image"] else ""
    location = entity["location"] if not is_in_hub else ""
    
    org_creators = OrganizationMember.objects.filter(
        organization__id=entity["id"], role__role_type=2
    ).values_list(
        "user__first_name",
        "user__last_name",
        "user__user_profile__thumbnail_image",
    )
    creator = ""
    creator_image = ""
    # only one creator possible but the query needs to be iterated through
    for org_creator in org_creators:
        creator += org_creator[0] + " " + org_creator[1]
        creator_image = (
            settings.BACKEND_URL + org_creator[2] if org_creator[2] else ""
        )

    card = generate_org_card(
        entity["name"],
        url,
        image_url,
        location,
        creator,
        creator_image,
        str(entity["members_count"]),
        str(entity["projects_count"]),
    )
    return {
            "card": card,
            "shortDescription": entity["short_description"],
            "url": url,
            "type": "organization",
        }

def generate_idea_mailjet_vars(entity: dict):
    # url for ideas: URL/hubs/<hubUrl>?idea=<slug>#ideas
    url = settings.FRONTEND_URL + "/hubs/" + entity["hub_shared_in"]["url_slug"] + "?idea=" + entity["url_slug"] + "#ideas"
    image_url = (settings.BACKEND_URL + entity["thumbnail_image"]) if entity["thumbnail_image"] else ""
    creator = entity["user"]["first_name"] + " " + entity["user"]["last_name"] if entity["user"] else ""
    creator_image = settings.BACKEND_URL + entity["user"]["image"] if entity["user"]["image"] else ""
    hub_icon = entity["hub_shared_in"]["icon"]
    print(hub_icon)
    
    card = generate_idea_card(
        entity["name"],
        url,
        image_url,
        creator,
        creator_image,
        hub_icon,
    )
    return {
            "card": card,
            "shortDescription": entity["short_description"],
            "url": url,
            "type": "idea",
        }
    

# # deprecated 
# def create_global_variables_for_weekly_recommendations_NUMBA2(
#     project_ids: List = [],
#     organization_ids: List = [],
#     idea_ids: List = [],
#     is_in_hub: bool = False,
# ) -> List:
#     main_page = "https://climateconnect.earth"
#     entities = []

#     projects = Project.objects.filter(id__in=project_ids).values_list(
#         "name",
#         "thumbnail_image",
#         "url_slug",
#         "loc__name",
#         "project_parent__parent_user__first_name",
#         "project_parent__parent_user__last_name",
#         "project_parent__parent_user__user_profile__thumbnail_image",
#         "project_parent__parent_organization__name",
#         "project_parent__parent_organization__thumbnail_image",
#         "short_description",
#     )
#     for project in projects:
#         if project[7]:
#             creator = project[7]
#             creator_image_url = settings.BACKEND_URL + project[8] if project[8] else ""
#         elif project[4] and project[5]:
#             creator = project[4] + " " + project[5]
#             creator_image_url = (
#                 settings.BACKEND_URL + "/" + project[6] if project[6] else ""
#             )
#         else:
#             creator = ""
#             creator_image_url = ""

#         project_template = {
#             "type": "project",
#             "name": project[0],
#             "imageUrl": (settings.BACKEND_URL + project[1])
#             if project[1]
#             else main_page,
#             "url": (settings.FRONTEND_URL + "/projects/" + project[2])
#             if project[2]
#             else main_page,
#             "location": project[3] if project[3] and not is_in_hub else "",
#             "creator": creator,
#             "creatorImageUrl": creator_image_url,
#             "category": "",
#             "shortDescription": project[9] if project[9] else "",
#         }
#         entities.append(project_template)

#     organizations = Organization.objects.filter(id__in=organization_ids).values_list(
#         "name",
#         "thumbnail_image",
#         "url_slug",
#         "location__name",
#         "id",
#         "short_description",
#     )
#     for organization in organizations:
#         org_creators = OrganizationMember.objects.filter(
#             organization__id=organization[4], role__role_type=2
#         ).values_list(
#             "user__first_name",
#             "user__last_name",
#             "user__user_profile__thumbnail_image",
#         )
#         creator = ""
#         # only one creator possible but the query needs to be iterated through
#         for org_creator in org_creators:
#             creator += org_creator[0] + " " + org_creator[1]
#             creator_image_url = (
#                 settings.BACKEND_URL + "/" + org_creator[2] if org_creator[2] else ""
#             )

#         organization_template = {
#             "type": "organization",
#             "name": organization[0],
#             "imageUrl": (settings.BACKEND_URL + organization[1])
#             if organization[1]
#             else "",
#             "url": (settings.FRONTEND_URL + "/organizations/" + organization[2])
#             if organization[2]
#             else main_page,
#             "location": organization[3] if organization[3] and not is_in_hub else "",
#             "creator": creator,
#             "creatorImageUrl": creator_image_url,
#             "tags": "",
#             "shortDescription": organization[5] if organization[5] else "",
#         }
#         entities.append(organization_template)

#     ideas = Idea.objects.filter(id__in=idea_ids).values_list(
#         "name",
#         "thumbnail_image",
#         "url_slug",
#         "hub__url_slug",
#         "location__name",
#         "user__first_name",
#         "user__last_name",
#         "user__user_profile__thumbnail_image",
#         "short_description",
#     )
#     for idea in ideas:
#         idea_template = {
#             "type": "idea",
#             "name": idea[0],
#             "imageUrl": (settings.BACKEND_URL + idea[1]) if idea[1] else "",
#             # url for ideas: URL/hubs/<hubUrl>?idea=<slug>#ideas
#             "url": (
#                 settings.FRONTEND_URL
#                 + "/hubs/"
#                 + idea[3]
#                 + "?idea="
#                 + idea[2]
#                 + "#ideas"
#             )
#             if (idea[2] and idea[3])
#             else main_page,
#             "location": idea[4] if idea[4] and not is_in_hub else "",
#             "creator": idea[5] + " " + idea[6] if idea[5] and idea[6] else "",
#             "creatorImageUrl": (settings.BACKEND_URL + "/" + idea[7])
#             if idea[7]
#             else "",
#             "tags": "",
#             "shortDescription": idea[8] if idea[8] else "",
#         }
#         entities.append(idea_template)

#     return entities
# deprecated end

def create_messages_for_weekly_recommendations(user_ids) -> List:
    users = User.objects.filter(id__in=user_ids).values_list(
        "email", "first_name", "last_name"
    )
    messages = []
    for user in users:
        messages.append(
            {
                "To": [{"Email": user[0], "Name": user[1] + " " + user[2]}],
                "Variables": {"FirstName": user[1]},
            }
        )
    return messages

# # deprecated
# def create_html_content_for_weekly_recommendations(entities):
#     """due to limitations in mailjet this function generates the card sections in html to be implemented directly in the mail"""

#     content = []
#     for entity in entities:
#         if entity["type"] == "project":
#             card = generate_project_card(
#                 entity["name"],
#                 entity["url"],
#                 entity["imageUrl"],
#                 entity["location"],
#                 entity["creator"],
#                 entity["creatorImageUrl"],
#                 entity["category"],
#             )
#             content.append(
#                 {
#                     "card": card,
#                     "shortDescription": entity["shortDescription"],
#                     "url": entity["url"],
#                     "type": entity["type"],
#                 }
#             )

#         if entity["type"] == "organization":
#             card = generate_org_card(
#                 entity["name"],
#                 entity["url"],
#                 entity["imageUrl"],
#                 entity["location"],
#                 entity["creator"],
#                 entity["creatorImageUrl"],
#             )
#             content.append(
#                 {
#                     "card": card,
#                     "shortDescription": entity["shortDescription"],
#                     "url": entity["url"],
#                     "type": entity["type"],
#                 }
#             )

#         if entity["type"] == "idea":
#             card = generate_idea_card(
#                 entity["name"],
#                 entity["url"],
#                 entity["imageUrl"],
#                 entity["location"],
#                 entity["creator"],
#                 entity["creatorImageUrl"],
#             )
#             content.append(
#                 {
#                     "card": card,
#                     "shortDescription": entity["shortDescription"],
#                     "url": entity["url"],
#                     "type": entity["type"],
#                 }
#             )

#     return content
#deprecated end

def generate_idea_card(name, url, thumbnail_url, creator, creator_image_url, hub_icon):
    if creator_image_url:
        creator_image_htmlsection = f"""
                        <div style="justify-content:center;display:flex;height:20px;width:20px;overflow:hidden;border-radius:50%;">
                        <img src={creator_image_url} style="object-fit:cover;">
                        </div> 
        """
    else:
        creator_image_htmlsection = f"""
                    <span class="material-icons" style="display:block;flex-basis:40px;font-size:20px;color: #bdbdbd">account_circle</span>
        """

    if creator:
        creator_htmlsection = f"""                 
                <div>
                    <span style="display:inline-flex;text-align:left;align-items:center;">
{creator_image_htmlsection}
                      <h6 style="margin-top:8px;margin-bottom:8px;display: inline-block;margin-left: 8px;white-space: nowrap;vertical-align: middle;font-weight:500;font-family:open sans;font-size:14px;">{creator}
                      </h6>
                    </span>
                  </div>
        """

    card = f"""
          <div style="padding:8px;color:rgba(0, 0, 0, 0.87);line-height:20px;font-family:open sans;font-size:14px;font-weight:400;">
            <a href="{url}" target="_blank" style="color: black; text-decoration: none;">
              <div style="display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;height:350px;background-color:rgb(248,248,248);border-radius:16px;border:3px solid #207178;overflow:hidden;text-align:center;transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;box-shadow: rgb(0 0 0 / 16%) 3px 3px 6px;">
                <div style="box-sizing:inherit;display:block;padding:8px;font-family:open sans;font-size:14px;font-weight:400;">
                  <h2 style="font-size:18px;font-weight:600;line-height:27px;margin:0px;">{name}</h2>
                  {creator_htmlsection}
                  <div>
                    
                  </div>
                </div>
                <div style="box-sizing:inherit;display:block;">
                  <div style="background-repeat: no-repeat;display:block;margin:0px;padding:0px;background-size:100%;background-origin:content-box;width:100%;background-position-y:50%;background-position-x:50%;background-image: url({thumbnail_url});">
                    <img style="margin:0px;padding:0px;width:100%;object-fit:cover;border-radius:inherit;background-position-y:inherit;visibility:hidden;" src="{thumbnail_url}" alt="" />
                  </div>
                </div>
              </div>
            </a>
          </div>
    """
    return card


def generate_org_card(name, url, thumbnail_url, location, creator, creator_image_url, members_count, projects_count):
    if creator_image_url:
        creator_image_htmlsection = f"""
                        <div style="justify-content:center;display:flex;height:20px;width:20px;overflow:hidden;border-radius:50%;">
                        <img src={creator_image_url} style="object-fit:cover;">
                        </div> 
        """
    else:
        creator_image_htmlsection = f"""
                    <span class="material-icons" style="display:block;flex-basis:40px;flex-grow:0;flex-shrink:0;font-size:20px;width:40px;color: #207178">account_circle</span>
        """

    if creator:
        creator_htmlsection = f"""
                <div style="display:block;margin-top:20px">
                    <span style="align-items:center;display:grid;margin-bottom:4px;grid-template-columns: 40px min-content;justify-content:center;text-align:center;">
{creator_image_htmlsection}
                      <span style="font-family:open sans;font-size:14px;font-weight:400;line-height:20px;overflow:hidden;max-width:220px;text-align:center">{creator}</span>
                    </span>
                  </div>
        """
    else: 
        creator_htmlsection = ""

    if location:
        location_htmlsection = f"""
                  <div style="display:block;margin-top:20px">
                    <span style="align-items:center;display:grid;margin-bottom:4px;grid-template-columns: 40px min-content;justify-content:center;text-align:center;">
                      <span class="material-icons" style="display:block;flex-basis:40px;flex-grow:0;flex-shrink:0;font-size:20px;width:40px;color:#207178">place</span>
                      <span style="font-family:open sans;font-size:14px;font-weight:400;line-height:20px;overflow:hidden;max-width:220px;text-align:center">{location}</span>
                    </span>
                  </div>        
        """
    else:
        location_htmlsection = ""

    card = f"""   
          <div style="padding:8px;color: rgba(0, 0, 0, 0.87);line-height:20px;">
            <a href="{url}" target="_blank" style="color: black; text-decoration: none;">
              <div style="display:flex;flex-direction:column;height:350px;margin:0px;background-color:rgb(241,241,241);background-size: calc(100% - 1px) 100%;border:1px solid rgba(0,0,0,0.12);border-radius:5px;border-image-repeat:stretch;box-shadow:rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;overflow:hidden;box-sizing:border-box;
              display:grid;grid-template-rows: min-content;transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;padding:0 14px;text-align:center;">

                <div style="display:block;">
                  <div style="height:80px;width80px;display:flex;justify-content:center;margin:24px auto 0px;overflow:hidden;position:relative;">
                    <img style="max-width: 220px;margin:0px;padding:0px;width:80px;border-radius:50%;object-fit:cover;" src="{thumbnail_url}" alt="" />
                  </div>

                  <div style="display:block;">
                    <h2 style="margin:5px;display:inline-block;line-height:32px;font-family:open sans;font-size:20px;font-weight:700;overflow:hidden;text-overflow:ellipsis;">{name}</h2>
                  </div>
                </div>
                <div style="padding:0px;display:grid;box-sizing:border-box;grid-template-rows: min-content;">
                  {creator_htmlsection}
                  {location_htmlsection}
                </div>
                <div style="box-sizing:border-box;align-items:center;align-self:end;display: grid;margin-bottom: 10px;padding:8px;grid-template-columns: 1fr 1fr;>
                    <div style="box-sizing:inherit;font-size: 14px;font-family: Open Sans;font-weight: 400;line-height: 20px;float: right;display: grid;margin-right: 20px;justify-content: center;grid-template-columns: 40px min-content;list-style-type: none;">
                        <span style="box-sizing:inherit;align-items:center;text-align:center;float: right;display: grid;margin-right: 20px;justify-content: center;grid-template-columns: 40px min-content;font-size:14px;font-family: Open Sans;font-weight: 400;line-height: 20px;">
                            <span class="material-icons" style="width:24px;height:24px;display: inline-block;font-size: 24px;flex-shrink: 0;overflow:hidden; text-align:center;color: #207178">group</span>
                            <p style="box-sizing:inherit;font-size: 1rem;font-family: Open Sans;font-weight: 400;line-height: 1.5;margin:0px;display: block;list-style-type: none;margin-block-start: 1em;margin-block-end: 1em;margin-inline-start: 0px;margin-inline-end: 0px;text-align: center;color: rgba(0, 0, 0, 0.87);">
                                {members_count}
                            </p>
                        </span
                    </div>
                    <div style="box-sizing:inherit;margin-left: 8px;font-size: 14px;font-family: Open Sans;font-weight: 400;line-height: 20px;display:block;text-align:center;">
                        <span style="align-items:center;box-sizing:inherit;float: left;display: grid;margin-left: 20px;justify-content: center;grid-template-columns: 40px min-content;">
                            <span class="material-icons" style="width:24px;height:24px;display: inline-block;font-size: 24px;flex-shrink: 0;overflow:hidden; text-align:center;color: #207178">assignment</span>
                            <p style="display: block;font-size: 1rem;font-family: Open Sans;font-weight: 400;line-height: 1.5;margin:0px;margin-block-start: 1em;margin-block-end: 1em;margin-inline-start: 0px;margin-inline-end: 0px;box-sizing:inherit;text-align: center;color: rgba(0, 0, 0, 0.87);">
                                {projects_count}
                            </p>
                        </span>
                    </div>
                </div>
              </div>
            </a>
          </div>
    """
    return card


def generate_project_card(
    name, url, thumbnail_url, location, creator, creator_image_url, category
):
    if creator_image_url:
        creator_image_htmlsection = f"""
                        <div style="justify-content:center;display:flex;height:20px;width:20px;overflow:hidden;border-radius:50%;">
                        <img src={creator_image_url} style="object-fit:cover;">
                        </div> 
        """
    else:
        creator_image_htmlsection = f"""
                        <span class="material-icons" style="display:block;flex-basis:40px;font-size:20px;color: rgba(0, 0, 0, 0.87)">account_circle</span>
        """

    if creator:
        creator_htmlsection = f"""
                    <div>
                      <span style="display:inline-flex;text-align:left;align-items:center;">
{creator_image_htmlsection}
                        <h6 style="margin-top:8px;margin-bottom:8px;display: inline-block;margin-left: 8px;white-space: nowrap;vertical-align: middle;font-weight:500;font-family:open sans;font-size:14px;">{creator}
                        </h6>
                      </span>
                    </div>           
        """
    else:
        creator_htmlsection = ""

    if location:
        location_htmlsection = f"""
                    <div>
                      <span style="display:inline-flex;text-align:left;align-items:center;">
                        <span class="material-icons" style="display:block;flex-basis:40px;font-size:20px;color: rgba(0, 0, 0, 0.87)">place</span>
                        <h6 style="margin-top:6px;margin-bottom:6px;display: inline-block;margin-left: 8px;white-space: nowrap;vertical-align: middle;font-weight:500;font-family:open sans;font-size:14px;">{location}
                        </h6>
                      </span>
                    </div>
        """
    else:
        location_htmlsection = ""

    if category:
        category_htmlsection = f"""
                    <div>
                    <span style="display:inline-flex;text-align:left;align-items:center;">
                        <span class="material-icons" style="display:block;flex-basis:40px;font-size:20px;color: rgba(0, 0, 0, 0.87)">explore</span>
                        <h6 style="margin-top:6px;margin-bottom:2px;display: inline-block;margin-left: 8px;white-space: nowrap;vertical-align: middle;font-weight:500;font-family:open sans;font-size:14px;">{category}
                        </h6>
                    </span>
                    </div>
        """
    else:
        category_htmlsection = ""

    card = f"""<div style="padding:8px;box-sizing:border-box;font-size:14px;font-weight:400;font-family:open sans;line-height:20px;">
            <a href="{url}" target="_blank" style="box-sizing:inherit;color: black; text-decoration: none;">
              <div style="box-sizing:inherit;height:350px;background-color:#FFF;border:1px solid #EEE;border-radius:3px;
              color: rgba(0, 0, 0, 0.87);transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;display:flex;flex-direction:column;overflow:hidden;box-shadow: rgb(0 0 0 / 16%) 3px 3px 6px;">
                <div style="height:175px;box-sizing: inherit;display: block;background-size: cover;background-repeat: no-repeat;background-position: center;background-image: url({thumbnail_url});">

                </div>
                <div style="box-sizing:inherit;display:block;">
                  <div style="box-sizing:inherit;display:block;margin-bottom:6px;padding:16px 16px 0px;">
                    <h2 style="font-family:open sans; font-size:15px;font-weight:700;line-height:24px">{name}</h2>
                  </div>
                  <div style="box-sizing:inherit;display:block;padding:0px 16px 16px;margin-left:auto;margin-right:auto;">
{creator_htmlsection}
{location_htmlsection}
{category_htmlsection}
                  </div>
                </div>
              </div>
            </a>
          </div>"""

    return card


def send_weekly_recommendations_email(
    messages: List,
    mailjet_global_vars,
    lang_code: str,
    is_in_hub: bool = False,
    sandbox_mode=False,
):

    template_key = "WEEKLY_RECOMMENDATIONS_EMAIL"

    template_id = get_template_id(template_key=template_key, lang_code=lang_code)

    if is_in_hub:
        subjects_by_language = {
            "en": "We have new recommendations in your area!",
            "de": "Wir haben neue Empfehlungen in deiner Region",
        }
    else:
        subjects_by_language = {
            "en": "We have new recommendations for you!",
            "de": "Wir haben neue Empfehlungen für dich!",
        }

    subject = subjects_by_language.get(lang_code, "en")

    global_variables = {
        "content": mailjet_global_vars,
    }

    data = {
        "Globals": {
            "From": {
                "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                "Name": "Climate Connect",
            },
            "TemplateID": int(template_id),
            "TemplateLanguage": True,
            "Variables": global_variables,
            "Subject": subject,
            "TemplateErrorReporting": {
                "Email": settings.MAILJET_ADMIN_EMAIL,
                "Name": "Mailjet Admin",
            },
        },
        "Messages": messages,
        "SandboxMode": sandbox_mode,
    }

    try:
        mail = mailjet_send_api.send.create(data=data)
    except Exception as ex:
        logger.error(f"EmailFailure: Exception sending email -> {ex}")
        print(f"EmailFailure: Exception sending email -> {ex}")

    if mail.status_code != 200:
        logger.error(f"EmailFailure: Error sending email -> {mail.text}")
        print(f"EmailFailure: Error sending email -> {mail.text}")

    return mail


def send_email_reminder_for_unread_notifications(
    user: User, user_notifications: List[UserNotification]
):
    total_notifications = user_notifications.count()
    language_code = get_user_lang_code(user=user)
    subject_by_language = {
        "en": f"You have {total_notifications} unread messages",
        "de": f"Du hast {total_notifications} ungelesene Nachrichten",
    }
    subject = subject_by_language.get(language_code, "en")
    website_link_by_language = {
        "en": "https://climateconnect.earth/inbox",
        "de": "https://climateconnect.earth/de/inbox",
    }
    website_link = website_link_by_language.get(language_code, "en")
    email_text_by_language = {
        "en": f"<p>Dear {user.first_name},</p><p>You have {total_notifications} new messages. Please respond to the people who reached out because we can only limit climate change if we work together and exchange knowledge.</p> <p><a href={website_link}>Click here</a> to check your inbox.</p><p>See you soon,</p><p>The Climate Connect Team</p>",  # NOQA
        "de": f"<p>Hallo {user.first_name},</p><p>Du hast {total_notifications} ungelesene Nachrichten von anderen Klimaschützer*innen. Bitte beantworte die Nachrichten, denn gemeinsam und durch Zusammenarbeit und Wissensaustausch können wir das 1,5 Grad Ziel erreichen.</p><p><a href={website_link}>Klicke hier</a>, um deinen Posteingang anzusehen.</p><p>Bis bald,</p><p>Deine Climate Connect Team</p>",  # NOQA
    }
    email_text = email_text_by_language.get(language_code, "en")
    data = {
        "Messages": [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect",
                },
                "To": [
                    {"Email": user.email, "Name": f"{user.first_name} {user.last_name}"}
                ],
                "Subject": subject,
                "HTMLPart": email_text,
            }
        ]
    }

    try:
        mail = mailjet_send_api.send.create(data=data)
    except Exception as ex:
        logger.error(f"EmailFailure: Exception sending email -> {ex}")

    if mail.status_code != 200:
        logger.error(f"EmailFailure: Error sending email -> {mail.text}")
