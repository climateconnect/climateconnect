import csv
import sys

lookup_table_file_path = "<path>"
original_table_file_path = "<path>"
lookup_osm_id_file_path = "<path>"
output_file = "<path>"


def open_csv(file_path: str):
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
        print(f"Error: The file '{file_path}' was not found.")
        exit(1)
    return rows


if __name__ == "__main__":
    if len(sys.argv) > 1:
        lookup_table_file_path = sys.argv[1]
    if len(sys.argv) > 2:
        original_table_file_path = sys.argv[2]
    if len(sys.argv) > 3:
        output_file = sys.argv[3]

    lookup_arr = open_csv(lookup_table_file_path)
    original = open_csv(original_table_file_path)
    lookup_osm_id = open_csv(lookup_osm_id_file_path)

    lookup = {}
    for row in lookup_arr:
        lookup[row["osm_id"]] = row

    for row in lookup_osm_id:
        lookup[row["osm_id"]] = row

    missing_osm = []
    missing_osm_type = []
    osm_ids_not_in_lookup = []

    for org in original:
        osm_id = org["osm_id"]
        if osm_id is None or len(osm_id) == 0:
            missing_osm.append(org)
            # org["osm_type"] = ""
            # continue

        if osm_id not in lookup:
            missing_osm_type.append(org)
            # org["osm_type"] = ""
            osm_ids_not_in_lookup.append(org)
            continue

        # osm_type_mapping = lookup[osm_id]
        # org["osm_type"] = osm_type_mapping["osm_type"]

    print("missing osm      :", len(missing_osm), [x["name"] for x in missing_osm])

    print(
        "osm_ids_not_in_lookup: ",
        len(osm_ids_not_in_lookup),
        [x["name"] for x in osm_ids_not_in_lookup],
    )

    print(
        "missing osm type :",
        len(missing_osm_type),
        [x["name"] for x in missing_osm_type],
    )
