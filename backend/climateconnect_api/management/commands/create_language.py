from typing import Any
from django.core.management.base import BaseCommand, CommandParser

from climateconnect_api.models.language import Language


class Command(BaseCommand):
    help = "Create new languages that we will support"

    def add_arguments(self, parser: CommandParser) -> None:
        language_code = parser.add_argument(
            "--language_code", dest="language_code", type=str
        )
        name = parser.add_argument(
            "--name", dest="name", type=str
        )
        native_name = parser.add_argument(
            "--native_name", dest="native_name", type=str
        )

    def handle(self, *args: Any, **options: Any) -> None:
        language_code = options['language_code']
        name = options['name']
        native_name = options['native_name']

        language, created = Language.objects.get_or_create(
            name=name, native_name=native_name, language_code=language_code
        )

        if not created:
            print("Language {} is already exists".format(language.name))
        else:
            print("Language {} successfully created.".format(language.name))
