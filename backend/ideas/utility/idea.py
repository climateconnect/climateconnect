import logging
import urllib.parse
from typing import Dict, Optional

from chat_messages.models.message import Participant

from ideas.models.comment import IdeaComment
from climateconnect_api.models.language import Language
from climateconnect_main.utility.general import get_image_from_data_url
from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from hubs.models import Hub
from ideas.models import Idea, IdeaTranslation
from location.utility import get_location
from organization.models import Organization
from rest_framework.exceptions import ValidationError
from climateconnect_api.utility.common import create_unique_slug

logger = logging.getLogger(__name__)


def verify_idea(url_slug: str) -> Optional[Idea]:
    try:
        url_slug = urllib.parse.quote(url_slug, safe="~()*!.'")
        idea = Idea.objects.get(url_slug=url_slug)
    except Idea.DoesNotExist:
        logger.error("Idea not found for {}".format(url_slug))
        idea = None

    return idea


def create_idea(data: dict, language: Optional[Language], creator: User) -> Idea:
    idea = Idea.objects.create(
        name=data["name"],
        short_description=data["short_description"],
        language=language,
        user=creator,
    )

    url_slug = create_unique_slug(idea.name, idea.id, Idea.objects)
    add_additional_create_idea_params(idea, data, url_slug)
    return idea


def add_additional_create_idea_params(idea: Idea, data: dict, url_slug: str) -> None:
    idea.url_slug = url_slug
    try:
        hub = Hub.objects.get(url_slug=data["hub"])
        hub_shared_in = Hub.objects.get(url_slug=data["hub_shared_in"])
    except Hub.DoesNotExist:
        idea.delete()
        raise ValidationError("Hub does not exist: " + data["hub"])
    idea.hub = hub
    idea.hub_shared_in = hub_shared_in
    if "location" in data:
        idea.location = get_location(data["location"])

    if "image" in data and "thumbnail_image" in data:
        idea.image = get_image_from_data_url(data["image"])[0]
        idea.thumbnail_image = get_image_from_data_url(data["thumbnail_image"])[0]
    if "parent_organization" in data:
        try:
            organization = Organization.objects.get(id=data["parent_organization"])
        except Organization.DoesNotExist:
            idea.delete()
            raise ValidationError("Organization does not exist!")
        idea.organization = organization

    try:
        idea.save()
    except IntegrityError:
        if url_slug.endswith(str(idea.id)):
            # It seems like we alread called this function and added the id to the url slug, but there is still an integrity error!
            # Seems like it is unrelated to the url_slug and there is some bigger problem
            idea.delete()
            raise ValidationError("Internal Server Error")
        else:
            # The url slug is already taken! We'll append the project id in the end to make it unique again
            add_additional_create_idea_params(idea, data, url_slug + str(idea.id))
    # organization if it's an organization's idea!
    # Don't forget to list ideas in the user profile


def idea_translations(
    idea: Idea, translations: Dict, source_language: Language
) -> None:
    for language_code in translations:
        try:
            language = Language.objects.get(language_code=language_code)
        except Language.DoesNotExist:
            language = None

        if language and language != source_language:
            idea_translation, created = IdeaTranslation.objects.get_or_create(
                idea=idea, language=language
            )

            idea_translation.is_manual_translation = translations[language_code][
                "is_manual_translation"
            ]

            if created:
                idea_translation.name_translation = translations[language_code]["name"]
                idea_translation.short_description_translation = translations[
                    language_code
                ]["short_description"]
            else:
                if (
                    translations[language_code]["name"]
                    != idea_translation.name_translation
                ):
                    idea_translation.name_translation = translations[language_code][
                        "name"
                    ]

                if (
                    translations[language_code]["short_description"]
                    != idea_translation.short_description_translation
                ):
                    idea_translation.short_description_translation = translations[
                        language_code
                    ]["short_description"]

            idea_translation.save()


def get_translation(idea: Idea, language_code: str) -> Optional[IdeaTranslation]:
    if idea.language and language_code != idea.language.language_code:
        return idea.translate_idea.filter(language__language_code=language_code).first()
    return None


def get_idea_name(idea: Idea, language_code: str) -> Optional[str]:
    if translation := get_translation(idea, language_code):
        return translation.name_translation

    return idea.name


def get_idea_short_description(idea: Idea, language_code: str) -> Optional[str]:
    if translation := get_translation(idea, language_code):
        return translation.short_description_translation

    return idea.short_description


def get_number_of_idea_comments(idea: Idea):
    return IdeaComment.objects.filter(
        idea=idea,
        is_abusive=False,
        deleted_at__isnull=True,
        parent_comment=None,
    ).count()


def get_number_of_idea_participants(idea: Idea):
    chat_user_count = Participant.objects.filter(
        chat__name=idea.name, is_active=True
    ).count()
    return chat_user_count
