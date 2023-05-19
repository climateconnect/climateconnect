from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.models.language import Language
from organization.models import Project, ProjectTranslation
from organization.utility.project import get_project_translations


def translate_project(project: Project) -> None:
    data: dict[str, Any] = {
        "name": project.name,
        "short_description": project.short_description,
        "translations": {},
        "source_language": "en",
    }

    if project.description:
        data["description"] = project.description
    if project.helpful_connections:
        data["helpful_connections"] = project.helpful_connections
    try:
        translations = get_project_translations(data)
    except ValueError:
        print("Error getting translation for project {}".format(project.name))

    if translations:
        for language_code in translations["translations"]:
            language = Language.objects.get(language_code=language_code)
            texts = translations["translations"][language_code]
            translation = ProjectTranslation.objects.create(
                project=project,
                language=language,
                name_translation=texts["name"],
                short_description_translation=texts["short_description"],
                is_manual_translation=False,
            )

            if "description" in texts:
                translation.description_translation = texts["description"]
            if "helpful_connections" in texts:
                translation.helpful_connections_translation = texts[
                    "helpful_connections"
                ]

            translation.save()
            print(
                "Translation in {} done for project {}".format(
                    language.name, project.name
                )
            )


class Command(BaseCommand):
    def handle(self, *args: Any, **options: Any) -> None:
        projects_to_translate = Project.objects.filter(translation_project=None)
        number_of_projects = projects_to_translate.count()
        print("Translating {} projects".format(number_of_projects))
        for idx, project in enumerate(projects_to_translate):
            print(
                "Starting project translation for {} ({}/{})".format(
                    project.name, idx + 1, number_of_projects
                )
            )
            translate_project(project)
