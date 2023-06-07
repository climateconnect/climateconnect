from organization.models.organization import Organization
from climateconnect_api.models.language import Language
from typing import Any
from django.core.management.base import BaseCommand
from climateconnect_api.models import UserProfile

from organization.models.project import Project


def migrate_elements(type: str, object: Project, language: Language):
    print("Total objects of type" + type + ": {}".format(object.count()))
    objects_counter = 0

    for object in object:
        print(object.language)
        if object.language is None:
            object.language = language
            object.save()
        objects_counter = objects_counter + 1
        print("Total objects of type " + type + " updated: {}".format(objects_counter))


# This command helps us migrate from a website that's purely in English to a multilanguage website
class Command(BaseCommand):
    def handle(self, *args: Any, **options: Any) -> None:
        required_languages = [
            {
                "name": "english",
                "native_name": "Englisch",
                "language_code": "en",
                "currency": "$",
            },
            {
                "name": "german",
                "native_name": "Deutsch",
                "language_code": "de",
                "currency": "€",
            },
        ]
        # Make sure all required languages exist. If they don't, then create them
        for language in required_languages:
            if not Language.objects.filter(
                language_code=language["language_code"]
            ).exists():
                Language.objects.create(**language)

        english = Language.objects.get(language_code="en")

        projects = Project.objects.filter(language__isnull=True)
        migrate_elements("project", projects, english)

        organizations = Organization.objects.filter(language__isnull=True)
        migrate_elements("organization", organizations, english)

        members = UserProfile.objects.filter(language__isnull=True)
        migrate_elements("user profile", members, english)
