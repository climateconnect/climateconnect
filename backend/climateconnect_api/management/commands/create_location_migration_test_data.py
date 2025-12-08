from django.core.management.base import BaseCommand
import csv
from pathlib import Path
from location.models import Location

DELETE_PREFIX = "DELETE-"


def safe_int(value_str):
    return int(value_str.strip()) if value_str and value_str.strip() else None


def safe_bool(value_str):
    if not value_str:
        return None
    cleaned_value = (
        value_str.strip().replace("“", "").replace("”", "").replace('"', "").lower()
    )
    if cleaned_value in ("true"):
        return True
    return False


def create_test_data_from_csv(file_path: str, limit: int = None) -> None:
    csv_file = Path(file_path)
    locations_to_create = []
    try:
        with open(csv_file, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            if reader.fieldnames:  # clean fieldnames from invisible strings
                cleaned_fieldnames = [
                    name.strip().replace('"', "").replace("\ufeff", "")
                    for name in reader.fieldnames
                ]
                reader.fieldnames = cleaned_fieldnames
            data_to_process = list(reader)
            if limit is not None:
                data_to_process = data_to_process[:limit]
            for line in data_to_process:
                test_place_name = DELETE_PREFIX + line["place_name"]
                loc = Location(
                    osm_id=safe_int(line["osm_id"]),
                    place_id=safe_int(line["place_id"]),
                    is_stub=safe_bool(line["is_stub"]),
                    is_formatted=safe_bool(line["is_formatted"]),
                    name=line["name"],
                    place_name=test_place_name,
                    exact_address=line["exact_address"],
                    city=line["city"],
                    state=line["state"],
                    country=line["country"],
                    centre_point=line["centre_point"],
                )
                locations_to_create.append(loc)

            if locations_to_create:
                Location.objects.bulk_create(locations_to_create)
            print(f"created {len(locations_to_create)} test lines")
    except FileNotFoundError:
        print(f"Error: file not found at path {csv_file}")
    except Exception as e:
        print(f"Error: {e}")


def delete_test_data() -> None:
    Location.objects.filter(place_name__startswith=DELETE_PREFIX).delete()


class Command(BaseCommand):
    help = "Create or delete test data for location migration testing"

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
        )

    def handle(self, *args, **options) -> str:
        file_path = options.get("file")
        limit = options.get("limit")
        if options.get("delete"):
            delete_test_data()
        elif file_path:
            create_test_data_from_csv(file_path, limit)
        else:
            self.stdout.write(
                self.style.ERROR("no mode chosen, use --delete or provide a --file")
            )


# usage:
# python manage.py create_location_migration_test_data --file <path_to_csv_table_with_test_database>
# python manage.py create_location_migration_test_data --delete
