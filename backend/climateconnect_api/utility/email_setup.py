import logging
from datetime import datetime, timedelta

from django.contrib.auth.models import User
from django.db.models import QuerySet
from climateconnect_api.models import UserNotification, UserProfile
from climateconnect_api.models.notification import EmailNotification
from climateconnect_api.utility.translation import get_user_lang_code, get_user_lang_url
from django.conf import settings
from mailjet_rest import Client # type: ignore

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
                    "Email": "christoph.stoll@climateconnect.earth",
                    "Name": "Christoph Stoll",
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


# sends an email to our own engineering email for testing purposes
def send_test_mail_to_engineering_email(subject, text_body):
    data = {
        "Messages": [
            {
                "From": {
                    "Email": settings.CLIMATE_CONNECT_SUPPORT_EMAIL,
                    "Name": "Climate Connect",
                },
                "To": [
                    {
                        "Email": "engineering@climateconnect.earth",
                        "Name": f"Engineering",
                    }
                ],
                "Subject": subject,
                "HTMLPart": text_body,
            }
        ]
    }

    try:
        mail = mailjet_send_api.send.create(data=data)
    except Exception as ex:
        logger.error(f"EmailFailure: Exception sending email -> {ex}")

    if mail.status_code != 200:
        logger.error(f"EmailFailure: Error sending email -> {mail.text}")


def send_email_reminder_for_unread_notifications(
    user: User, user_notifications: QuerySet[UserNotification]
):
    total_notifications = user_notifications.count()
    language_code = get_user_lang_code(user=user)
    subject_by_language = {
        "en": f"You have {total_notifications} unread {'messages' if total_notifications > 1 else 'message'}",
        "de": f"Du hast {total_notifications} ungelesene {'Nachrichten' if total_notifications > 1 else 'Nachricht'}",
    }
    subject = subject_by_language.get(language_code, "en")
    website_link_by_language = {
        "en": "https://climateconnect.earth/inbox",
        "de": "https://climateconnect.earth/de/inbox",
    }
    website_link = website_link_by_language.get(language_code, "en")
    email_text_by_language = {
        "en": f"<p>Dear {user.first_name},</p><p>You have {total_notifications} unread {'messages' if total_notifications > 1 else 'message'} from other climate protectors. Please respond to the people who reached out. <br />We can only effectively fight the climate crisis if we work together and exchange knowledge.</p> <p><b><a href={website_link}>Click here</a> to check your inbox.</b></p><p>See you soon,</p><p>The Climate Connect Team</p>",  # NOQA
        "de": f"<p>Hallo {user.first_name},</p><p>Du hast {total_notifications} ungelesene {'Nachrichten' if total_notifications > 1 else 'Nachricht'} von anderen Klimaschützer*innen. Bitte beantworte die Nachrichten.<br />Nur gemeinsam und durch Zusammenarbeit und Wissensaustausch können wir das 1,5 Grad Ziel erreichen.</p><p><b><a href={website_link}>Klicke hier</a>, um deinen Posteingang anzusehen.</b></p><p>Bis bald,</p><p>Deine Climate Connect Team</p>",  # NOQA
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
