from organization.models import Organization


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
