from typing import Dict, Optional
from climateconnect_api.models import UserProfile, UserProfileTranslation, Language


def create_user_profile_translation(
    translations: Dict,
    user_profile: UserProfile,
    is_manual_translation: bool,
    language_code: str,
) -> None:
    texts = translations["translations"][language_code]
    language = Language.objects.get(language_code=language_code)
    user_profile_translation = UserProfileTranslation.objects.create(
        user_profile=user_profile,
        language=language,
        is_manual_translation=is_manual_translation,
    )
    if texts["biography"]:
        user_profile_translation.biography_translation = texts["biography"]
    user_profile_translation.save()


def get_translation(
    user_profile: UserProfile, language_code: str
) -> Optional[UserProfileTranslation]:
    if language_code != user_profile.language:
        return user_profile.profile_translation.filter(
            language__language_code=language_code
        ).first()
    return None


def get_user_profile_biography(
    user_profile: UserProfile, language_code: str
) -> Optional[str]:
    if translation := get_translation(user_profile, language_code):
        return translation.biography_translation

    return user_profile.biography
