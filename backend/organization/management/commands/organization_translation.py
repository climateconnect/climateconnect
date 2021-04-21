from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.models.language import Language
from climateconnect_api.utility.translation import get_translations
from organization.models import Organization, OrganizationTranslation


def translate_organization(organization: Organization) -> None:
    texts = {'short_description': organization.short_description}
    if organization.school:
        texts['school'] = organization.school
    if organization.organ:
        texts['organ'] = organization.organ
    
    try:
        translations = get_translations(texts, {}, 'en', [])
    except ValueError as ve:
        print("Error getting translation for organization {}".format(organization.name))
        translations = None
    
    if translations:
        for language_code in translations['translations']:
            language = Language.objects.get(language_code=language_code)
            texts = translations['translations'][language_code]
            org_translation = OrganizationTranslation(
                organization=organization, language=language,
                short_description_translation=texts['short_description']
            )

            if 'organ' in texts:
                org_translation.organ_translation = texts['organ']
            if 'school' in texts:
                org_translation.school_translation = texts['school']
            org_translation.save()
            print("Organization {} translation successful in language {}".format(
                organization.name, language.name
            ))


class Command(BaseCommand):
    def handle(self, *args: Any, **options: Any) -> None:
        for organization in Organization.objects.all():
            print("Starting organization translation for {}".format(organization.name))
            translate_organization(organization)