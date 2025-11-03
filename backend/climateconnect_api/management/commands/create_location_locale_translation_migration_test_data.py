from django.core.management.base import BaseCommand
import csv
from pathlib import Path
from location.models import LocationTranslation

DELETE_PREFIX = 'DELETE-'

def safe_int(value_str):
    return int(value_str.strip()) if value_str and value_str.strip() else None


def create_test_data_from_csv(file_path: str, limit: int = None) -> None:
    csv_file = Path(file_path)
    translations_to_create = []
    try:
        with open(csv_file, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            if reader.fieldnames: #clean fieldnames from invisible strings
                cleaned_fieldnames = [
                    name.strip().replace('"', '').replace('\ufeff', '')
                    for name in reader.fieldnames
                ]
                reader.fieldnames = cleaned_fieldnames
            data_to_process = list(reader)
            if limit is not None:
                data_to_process = data_to_process[:limit]
            for line in data_to_process:
                test_name = DELETE_PREFIX + line['name']
                loc = LocationTranslation(
                    name_translation = test_name,
                    city_translation = line['city'],
                    state_translation = line['state'],
                    country_translation = line['country'],
                    language_id = 1, #because until now there is only english entries
                    location_id = safe_int(line['id']),
                )
                translations_to_create.append(loc)

            if translations_to_create:
                LocationTranslation.objects.bulk_create(translations_to_create)
            print(f"created {len(translations_to_create)} test lines")
    except FileNotFoundError:
        print(f"Error: file not found at path {csv_file}")
    except Exception as e:
        print(f"Error: {e}")

def delete_test_data() -> None:
    LocationTranslation.objects.filter(name_translation__startswith=DELETE_PREFIX).delete()


class Command(BaseCommand):
    help = "Create badges data for users"

    def add_arguments(self, parser):
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Delete all locations whose place_name starts with 'DELETE-'",
        )
        parser.add_argument(
            "-n",
            "--number",
            type=int,
            help="Limit the number of generated Locations",
        )
        parser.add_argument(
            "-f",
            "--file",
            type=str,
            help="Path to the CSV file containing test data",
            #required=True,
        )

    def handle(self, *args, **options) -> str:
        file_path = options.get("file")
        limit = options.get("limit")
        if options.get("delete"):
            delete_test_data()
        elif file_path: 
            create_test_data_from_csv(file_path, limit)
        else:
            self.stdout.write(self.style.ERROR("no mode chosen, use --delete or provide a --file"))

