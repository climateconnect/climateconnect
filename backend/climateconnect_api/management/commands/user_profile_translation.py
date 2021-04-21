from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.models.language import Language
from climateconnect_api.utility.translation import get_translations
from climateconnect_api.models import UserProfile, UserProfileTranslation, user


def translate_user_profile(user_profile: UserProfile) -> None:
    texts = {}
    if user_profile.biography:
        texts['biography'] = user_profile.biography

    try:
        translations = get_translations(texts, {}, 'en')
    except ValueError as ve:
        print("Error getting translation for user {}".format(
            user_profile.user.first_name
        ))
        translations = None
    
    if translations:
        for language_code in translations['translations']:
            language = Language.objects.get(language_code=language_code)
            texts = translations['translations'][language_code]
            user_profile_translation = UserProfileTranslation(
                user_profile=user_profile, language=language
            )
            if 'biography' in texts:
                user_profile_translation.biography_translation = texts['biography']

            print("User {} translation successful in language {}".format(
                user_profile.user.first_name, language.name
            ))


class Command(BaseCommand):
    def handle(self, *args: Any, **options: Any) -> None:
        for user_profile in UserProfile.objects.all():
            print("Starting user translation for {}".format(
                user_profile.user.first_name
            ))
            translate_user_profile(user_profile)
