import csv
from pathlib import Path
from create_osm_type_data import create_csv_lookup_table

# from find_osm_id_for_locatios_with_invalid_osm_id import create_csv_lookup_table as cclt
from backend.climateconnect_api.management.commands.osm_data_retrieval_scripts.find_osm_id_for_locations_with_invalid_osm_id import (
    getLocations,
)

CURRENT_DIR = Path(__file__).resolve()
LOOKUP_DIR = CURRENT_DIR.parent.parent
PATH_TO_KNOWN_LOOKUP = str(LOOKUP_DIR / "osm_lookup_tables" / "lookup.csv")
PATH_TO_KNOWN_LOOKUP_OSM_ID = str(
    LOOKUP_DIR / "osm_lookup_tables" / "osm_id_lookup.csv"
)
PATH_TO_CSV_OF_CURRENT_DATABASE = "path/to/fullCurrentDB.csv"


def open_csv(file_path: str) -> list[dict]:
    rows = []
    try:
        with open(file_path, mode="r", newline="", encoding="utf-8") as file:
            # csv.DictReader maps the header row to keys in a dictionary for each data row
            reader = csv.DictReader(file)
            if reader.fieldnames:  # clean fieldnames from invisible strings
                cleaned_fieldnames = [
                    name.strip().replace('"', "").replace("\ufeff", "")
                    for name in reader.fieldnames
                ]
                reader.fieldnames = cleaned_fieldnames
            for row in reader:
                rows.append(row)
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Required migration data file '{file_path}' was not found."
        )
    return rows


def extract_osm_ids(csv_path):
    path = Path(csv_path)
    unique_osm_ids = set()
    if not path.exists():
        print(f"Error: path not found: {path}")
        return []

    rows = open_csv(csv_path)

    for row in rows:
        if row["osm_id"]:
            try:
                osm_id_str = row["osm_id"].strip()
                if osm_id_str.isdigit():
                    unique_osm_ids.add(osm_id_str)
                else:
                    print(f"WARNING: non-numeric osm_id: {osm_id_str}")

            except ValueError:
                print(f"Warning: invalid osm_id '{row['osm_id']}' skipped.")
                continue

    print(f"{len(unique_osm_ids)} unique osm_id's successfully extracted from {path}.")

    return sorted(list(unique_osm_ids))


# known_osm_ids = extract_osm_ids(PATH_TO_KNOWN_LOOKUP)
# known_osm_ids.extend(extract_osm_ids(PATH_TO_KNOWN_LOOKUP_OSM_ID))
# all_osm_ids = extract_osm_ids(PATH_TO_CSV_OF_CURRENT_DATABASE)
# new_osm_ids = [osm_id for osm_id in all_osm_ids if osm_id not in known_osm_ids]
# print(f"{len(new_osm_ids)} new osm_id's found that are not in the known lookup tables.")


# create_csv_lookup_table(new_osm_ids, "/home/kathi/ClimateConnect/Arbeitsdateien/newLookup.csv")

csv_db = PATH_TO_CSV_OF_CURRENT_DATABASE
csv_in = "path/to/invalid_osm_ids_file.csv"
csv_out = "path/to/new_osm_id_lookup.csv"
locations = getLocations(csv_in, csv_db)
create_csv_lookup_table(locations, csv_out)

# if invalid locations exist, run cclt to create a lookup table for them
