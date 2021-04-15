from typing import Dict
from climateconnect_api.models.language import Language

from organization.models import Organization, OrganizationTranslation


def check_organization(organization_id: str) -> Organization:
    try:
        organization = Organization.objects.get(id=int(organization_id))
    except Organization.DoesNotExist:
        organization = None
    return organization


def get_organization_name(organization: Organization, language_code: str) -> str:
    if language_code != organization.language.language_code and \
        organization.translation_org.filter(language__language_code=language_code).exists():
        return organization.translation_org.get(
            language__language_code=language_code
        ).name_translation
    
    return organization.name


def get_organization_short_description(organization: Organization, language_code: str) -> str:
    if language_code != organization.language.language_code and \
        organization.translation_org.filter(language__language_code=language_code).exists():
        return organization.translation_org.get(
            language__language_code=language_code
        ).short_description_translation
    
    return organization.short_description



def create_orgnaization_translation(
    organization: Organization, language: Language, texts: Dict,
    is_manual_translation: bool
) -> None:
    org_translation = OrganizationTranslation.objects.create(
        organization=organization, language=language,
        name_translation=texts['name'],
        is_manual_translation=is_manual_translation
    )
    if 'short_description' in texts:
        org_translation.short_description_translation = texts['short_description']
    
    org_translation.save()
