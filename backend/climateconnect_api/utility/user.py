from typing import Dict
from climateconnect_api.models import UserProfile, UserProfileTranslation, Language


def create_user_profile_translation(
    translations: Dict, user_profile: UserProfile, is_manual_translation: bool,
    language_code: str
) -> None:
    texts = translations['translations'][language_code]
    language = Language.objects.get(language_code=language_code)
    user_profile_translation = UserProfileTranslation.objects.create(
        user_profile=user_profile, language=language,
        name_translation=texts['name'],
        is_manual_translation=is_manual_translation
    )
    if texts['biography']:
        user_profile_translation.biography_translation = texts['biography']
    user_profile_translation.save()