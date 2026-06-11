import csv
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "climateconnect_main.settings")

import django  # noqa: E402

django.setup()

from location.models import Location  # noqa: E402


def create_mapping_table(outfile: str):
    """
    Creates a CSV mapping table that links unique OSM type-id-class-class_type
    combinations to the corresponding Location IDs in the database.
    """
    fieldnames = ["osm_combination", "location_ids"]
    outpath = Path(outfile)
    outpath.parent.mkdir(parents=True, exist_ok=True)

    osm_unique_locations = set()
    locations_with_osm = (
        Location.objects.filter(
            osm_id__isnull=False,
            osm_type__isnull=False,
            osm_class__isnull=False,
            osm_class_type__isnull=False,
        )
        .exclude(osm_type="")
        .exclude(osm_class="")
        .exclude(osm_class_type="")
    )

    for loc in locations_with_osm:
        key = f"{loc.osm_type}{loc.osm_id}-{loc.osm_class}:{loc.osm_class_type}"
        osm_unique_locations.add(key)

    try:
        with open(outpath, "w", newline="", encoding="utf-8") as csvout:
            writer = csv.DictWriter(csvout, fieldnames=fieldnames)
            writer.writeheader()
            rows_written = 0

            for osm_key in osm_unique_locations:
                # Parse OSM key: format ist "T123-class:class_type" (T=type, 123=id)
                type_id_part, class_part = osm_key.split("-", maxsplit=1)
                osm_type = type_id_part[0]
                osm_id = type_id_part[1:]
                osm_class, osm_class_type = class_part.split(":", maxsplit=1)

                location_ids = Location.objects.filter(
                    osm_id=osm_id,
                    osm_type=osm_type,
                    osm_class=osm_class,
                    osm_class_type=osm_class_type,
                ).values_list("id", flat=True)

                writer.writerow(
                    {
                        "osm_combination": osm_key,
                        "location_ids": ",".join(map(str, location_ids)),
                    }
                )
                rows_written += 1

            print(
                f"\nSuccessfully saved {rows_written} entries to {outpath.resolve()}."
            )

    except Exception as e:
        print(f"Error: {e}")
        raise


if __name__ == "__main__":
    create_mapping_table("../osm_lookup_tables/mapping.csv")
