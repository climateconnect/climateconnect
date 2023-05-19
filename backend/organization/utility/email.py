import logging
import re
from organization.utility.project import get_project_name
from organization.utility.organization import get_organization_name


from climateconnect_api.utility.email_setup import send_email
from climateconnect_api.utility.translation import get_user_lang_code, get_user_lang_url
from django.conf import settings
from mailjet_rest import Client

logger = logging.getLogger(__name__)

mailjet = Client(
    auth=(settings.MJ_APIKEY_PUBLIC, settings.MJ_APIKEY_PRIVATE), version="v3.1"
)


def linkify_mentions(content: str):
    r = re.compile("(@@@__(?P<url_slug>[^\^]*)\^\^__(?P<display>[^\@]*)@@@\^\^\^)")
    matches = re.findall(r, content)

    for m in matches:
        whole, _, display = m[0], m[1], m[2]
        content = content.replace(whole, "@" + display)
    return content


def send_project_comment_reply_email(user, project, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Someone replied to your comment on Climate Connect",
        "de": "Jemand hat auf deinen Kommentar auf Climate Connect geantwortet",
    }
    base_url = settings.FRONTEND_URL
    url_ending = "/projects/" + project.url_slug + "#comments"
    variables = {
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "CommentText": linkify_mentions(comment),
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
        "ProjectName": project.name,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="PROJECT_COMMENT_REPLY_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_reply_to_your_comment",
        notification=notification,
    )


def send_project_comment_email(user, project, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Somebody left a comment on your project {} on Climate Connect".format(
            project.name
        ),
        "de": "Jemand hat dein Projekt {} auf Climate Connect kommentiert".format(
            project.name
        ),
    }
    base_url = settings.FRONTEND_URL
    url_ending = "/projects/" + project.url_slug + "#comments"
    variables = {
        "ProjectName": project.name,
        "CommentText": linkify_mentions(comment),
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="PROJECT_COMMENT_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_comment_on_your_project",
        notification=notification,
    )


def send_idea_comment_email(user, idea, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Somebody left a comment on your idea '{}' on Climate Connect".format(
            idea.name
        ),
        "de": "Jemand hat einen Kommentar zu deiner Idee '{}' auf Climate Connect hinterlassen.".format(
            idea.name
        ),
    }
    base_url = settings.FRONTEND_URL
    url_ending = (
        "/hubs/" + idea.hub_shared_in.url_slug + "?idea=" + idea.url_slug + "#ideas"
    )

    variables = {
        "IdeaName": idea.name,
        "CommentText": linkify_mentions(comment),
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="IDEA_COMMENT_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_comment_on_your_idea",
        notification=notification,
    )


# @entity_type: either "project" or "idea"
# @entity: the idea or project object (depending on entity_type)
def send_mention_email(user, entity_type, entity, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Somebody mentioned you in a comment on Climate Connect",
        "de": "Jemand hat dich in einem Kommentar auf Climate Connect erwähnt",
    }

    base_url = settings.FRONTEND_URL
    variables = {
        "CommentText": linkify_mentions(comment),
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
    }
    if entity_type == "project":
        variables["ProjectName"] = entity.name
        url_ending = "/projects/" + entity.url_slug + "#comments"
        template_key = "PROJECT_MENTION_TEMPLATE_ID"
    if entity_type == "idea":
        variables["IdeaName"] = entity.name
        url_ending = (
            "/hubs/"
            + entity.hub_shared_in.url_slug
            + "?idea="
            + entity.url_slug
            + "#ideas"
        )
        template_key = "IDEA_MENTION_TEMPLATE_ID"
    variables["url"] = base_url + get_user_lang_url(lang_code) + url_ending

    send_email(
        user=user,
        variables=variables,
        template_key=template_key,
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_mention",
        notification=notification,
    )


def send_idea_comment_reply_email(user, idea, comment, sender, notification):
    lang_code = get_user_lang_code(user)
    subjects_by_language = {
        "en": "Someone replied to your comment on Climate Connect",
        "de": "Jemand hat auf deinen Kommentar auf Climate Connect geantwortet.",
    }

    base_url = settings.FRONTEND_URL
    url_ending = (
        "/hubs/" + idea.hub_shared_in.url_slug + "?idea=" + idea.url_slug + "#ideas"
    )

    variables = {
        "FirstName": user.first_name,
        "CommenterName": sender.first_name + " " + sender.last_name,
        "CommentText": linkify_mentions(comment),
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
        "IdeaName": idea.name,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="IDEA_COMMENT_REPLY_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_reply_to_your_comment",
        notification=notification,
    )


def send_project_follower_email(user, project_follower, notification):
    lang_code = get_user_lang_code(user)
    follower_name = (
        project_follower.user.first_name + " " + project_follower.user.last_name
    )
    subjects_by_language = {
        "en": "{} now follows your project on Climate Connect".format(follower_name),
        "de": "{} folgt jetzt deinem Projekt auf Climate Connect".format(follower_name),
    }

    base_url = settings.FRONTEND_URL
    url_ending = (
        "/projects/" + project_follower.project.url_slug + "?show_followers=true"
    )

    variables = {
        "FollowerName": follower_name,
        "FirstName": user.first_name,
        "ProjectName": project_follower.project.name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="PROJECT_FOLLOWER_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_new_project_follower",
        notification=notification,
    )


def send_organization_follower_email(user, organization_follower, notification):
    lang_code = get_user_lang_code(user)

    organization_name = get_organization_name(
        organization_follower.organization, lang_code
    )

    following_user_full_name = (
        organization_follower.user.first_name
        + " "
        + organization_follower.user.last_name
    )

    subjects_by_language = {
        "en": "{} now follows {} on Climate Connect".format(
            following_user_full_name, organization_name
        ),
        "de": "{} folgt jetzt {} auf Climate Connect".format(
            following_user_full_name, organization_name
        ),
    }

    base_url = settings.FRONTEND_URL
    url_ending = (
        "/organizations/"
        + organization_follower.organization.url_slug
        + "?show_followers=true"
    )

    variables = {
        "RecipientFirstName": user.first_name,
        "FollowingUserFullName": following_user_full_name,
        "OrganizationName": organization_name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="ORGANIZATION_FOLLOWER_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_new_organization_follower",
        notification=notification,
    )


def send_org_project_published_email(user, org_project_published, notification):
    lang_code = get_user_lang_code(user)

    organization_name = get_organization_name(
        org_project_published.organization, lang_code
    )
    project_name = get_project_name(org_project_published.project, lang_code)

    subjects_by_language = {
        "en": "New climate project from {}: {}".format(organization_name, project_name),
        "de": "Neues Klimaprojekt von {} : {}".format(organization_name, project_name),
    }

    base_url = settings.FRONTEND_URL
    url_ending = "/projects/" + org_project_published.project.url_slug

    variables = {
        "FirstName": user.first_name,
        "OrganizationName": organization_name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
        "ProjectName": project_name,
    }

    send_email(
        user=user,
        variables=variables,
        template_key="ORG_PUBLISHED_NEW_PROJECT_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_new_project_from_followed_org",
        notification=notification,
    )


def send_project_like_email(user, project_like, notification):
    lang_code = get_user_lang_code(user)
    liking_user_name = project_like.user.first_name + " " + project_like.user.last_name
    subjects_by_language = {
        "en": "{} liked your project on Climate Connect".format(liking_user_name),
        "de": "{} gefällt dein Projekt auf Climate Connect".format(liking_user_name),
    }

    base_url = settings.FRONTEND_URL
    url_ending = "/projects/" + project_like.project.url_slug + "?show_likes=true"

    variables = {
        "LikingUserName": liking_user_name,
        "FirstName": user.first_name,
        "ProjectName": project_like.project.name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="PROJECT_LIKE_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_new_project_like",
        notification=notification,
    )


def send_join_project_request_email(user, request, requester, notification):
    lang_code = get_user_lang_code(user)
    requester_name = requester.first_name + " " + requester.last_name
    subjects_by_language = {
        "en": "{} requested to join your project on Climate Connect".format(
            requester_name
        ),
        "de": "{} möchte bei deinem Project auf Climate Connect mitmachen".format(
            requester_name
        ),
    }

    base_url = settings.FRONTEND_URL
    url_ending = (
        "/projects/" + request.target_project.url_slug + "?show_join_requests=true"
    )

    variables = {
        "RequesterName": requester_name,
        "FirstName": user.first_name,
        "ProjectName": request.target_project.name,
        "url": base_url + get_user_lang_url(lang_code) + url_ending,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="PROJECT_JOIN_REQUEST_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="email_on_join_request",
        notification=notification,
    )
