import logging
from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.models.language import Language
from climateconnect_api.utility.translation import get_translations
from climateconnect_api.models import UserProfile, UserProfileTranslation


def translate_user_profile(user_profile: UserProfile) -> None:
    texts = {}
    if user_profile.biography:
        texts["biography"] = user_profile.biography

    try:
        translations = get_translations(texts, {}, "en")
    except ValueError:
        print(
            "Error getting translation for user {}".format(user_profile.user.first_name)
        )
        translations = None

    if translations:
        for language_code in translations["translations"]:
            language = Language.objects.get(language_code=language_code)
            texts = translations["translations"][language_code]
            user_profile_translation = UserProfileTranslation.objects.create(
                user_profile=user_profile, language=language
            )
            if "biography" in texts:
                user_profile_translation.biography_translation = texts["biography"]

            user_profile_translation.save()

            logging.error(
                "User {} translation successful in language {}".format(
                    user_profile.user.first_name, language.name
                )
            )


class Command(BaseCommand):
    def handle(self, *args: Any, **options: Any) -> None:
        profiles_to_translate = UserProfile.objects.filter(profile_translation=None)
        number_of_profiles = profiles_to_translate.count()
        print("Translating {} profiles".format(number_of_profiles))
        for idx, user_profile in enumerate(profiles_to_translate):
            print(
                "Starting user translation for {} ({}/{})".format(
                    user_profile.user.first_name + " " + user_profile.user.last_name,
                    idx + 1,
                    number_of_profiles,
                )
            )
            translate_user_profile(user_profile)
