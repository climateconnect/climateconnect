from django.core.management.base import BaseCommand

from location.models import Location, LocationTranslation


def create_english_translations_from_locations(limit: int = None) -> None:

    translations = []
    locations_data = []

    try:
        query = Location.objects.all().values("id", "name", "city", "state", "country")
        if limit is not None:
            query = query[:limit]
        locations_data = list(query)
    except Exception as e:
        print(f"error while querying data from Location: {e}")
        return

    for location in locations_data:
        loc_translation = LocationTranslation(
            name_translation=location["name"],
            city_translation=location["city"],
            state_translation=location["state"],
            country_translation=location["country"],
            language_id=2,  # because english has the id=2 and there are only english entries in location_location
            location_id=location["id"],
        )
        translations.append(loc_translation)

    if translations:
        try:
            LocationTranslation.objects.bulk_create(translations)
            print(f"created {len(translations)} translations")
        except Exception as e:
            print(f"Error: {e}")


def delete_translations(lang_id: int) -> None:
    deleted_count, _ = LocationTranslation.objects.filter(language_id=lang_id).delete()
    print(
        f"successfully deleted {deleted_count} translations with language_id={lang_id}."
    )


class Command(BaseCommand):
    help = "Create badges data for users"

    def add_arguments(self, parser):
        parser.add_argument(
            "--delete",
            action="store_true",
            help="delete english translations from LocationTranslation",
        )
        parser.add_argument(
            "--language-id",
            type=int,
            default=2,
            help="default=english (else language with language_id) translations",
        )
        parser.add_argument(
            "-n",
            "--number",
            type=int,
            help="Limit the number of generated Locations",
        )
        parser.add_argument(
            "--create",
            action="store_true",
            help="create english translations in LocationTranslation'",
        )

    def handle(self, *args, **options) -> str:

        limit = options.get("number")
        language_id = options.get("language_id")

        if options.get("delete"):
            delete_translations(language_id)
        elif options.get("create"):
            create_english_translations_from_locations(limit)
        else:
            self.stdout.write(
                self.style.ERROR("no mode chosen, use --delete or --create")
            )
