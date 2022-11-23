from typing import Dict
from climateconnect_api.models import UserProfile, UserProfileTranslation, Language
from django.contrib.gis.db.models.functions import Distance
from django.db.models import Q

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


def get_user_profile_biography(user_profile: UserProfile, language_code: str) -> str:
    if (
        language_code != user_profile.language.language_code
        and user_profile.profile_translation.filter(
            language__language_code=language_code
        ).exists()
    ):
        return user_profile.profile_translation.get(
            language__language_code=language_code
        ).biography_translation

    return user_profile.biography


def get_user_location_from_search(users, location_data):
    return (
                users.filter(
                    Q(location__country=location_data["country"])
                    & (
                        Q(
                            location__multi_polygon__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                        | Q(
                            location__centre_point__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                    )
                )
                .annotate(
                    distance=Distance(
                        "location__centre_point", location_data["location"]
                    )
                )
                .order_by("distance")
            )