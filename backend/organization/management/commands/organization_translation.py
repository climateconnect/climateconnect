from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.models.language import Language
from climateconnect_api.utility.translation import get_translations
from organization.models import Organization, OrganizationTranslation


def translate_organization(organization: Organization) -> None:
    texts = {"short_description": organization.short_description}
    if organization.school:
        texts["school"] = organization.school
    if organization.organ:
        texts["organ"] = organization.organ
    if organization.about:
        texts["about"] = organization.about

    try:
        translations = get_translations(texts, {}, "en")
    except ValueError:
        print("Error getting translation for organization {}".format(organization.name))
        translations = None

    if translations:
        for language_code in translations["translations"]:
            language = Language.objects.get(language_code=language_code)
            texts = translations["translations"][language_code]
            org_translation = OrganizationTranslation.objects.create(
                organization=organization,
                language=language,
                short_description_translation=texts["short_description"],
            )

            if "organ" in texts:
                org_translation.organ_translation = texts["organ"]
            if "school" in texts:
                org_translation.school_translation = texts["school"]
            if "about" in texts:
                org_translation.about_translation = texts["about"]
            org_translation.save()
            print(
                "Organization {} translation successful in language {}".format(
                    organization.name, language.name
                )
            )


class Command(BaseCommand):
    def handle(self, *args: Any, **options: Any) -> None:
        orgs_to_translate = Organization.objects.filter(translation_org=None)
        number_of_organizations = orgs_to_translate.count()
        print("Translating {} organizations".format(number_of_organizations))
        for idx, organization in enumerate(orgs_to_translate):
            print(
                "Starting organization translation for {} ({}/{})".format(
                    organization.name, idx + 1, number_of_organizations
                )
            )
            translate_organization(organization)
