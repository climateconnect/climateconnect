import csv
from pathlib import Path
from django.db import migrations, models
CURRENT_DIR = Path(__file__).resolve()
LOOKUP_DIR = CURRENT_DIR.parent.parent.parent

LOOKUP_OSM_DATA_FILE = str(LOOKUP_DIR / "climateconnect_api" / "management" / "commands" / "osm_lookup_tables" / "osm_lookup_final_ones.csv")

def safe_int_conversion(string_value):
    if string_value is None:
        return None
    string_value = string_value.strip() #remove spaces, tabs, ...
    if not string_value:
        return None
    try:
        return int(string_value)
    except Exception as e:
        print(f"WARNING: '{string_value}' could not be converted to int")
        return None

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
        raise FileNotFoundError(f"Required migration data file '{file_path}' was not found.")
    return rows


def fill_missing_osm_data(apps, schema_editor, lookup_osm_data_file: str = LOOKUP_OSM_DATA_FILE):
    Location = apps.get_model("location", "Location")
    lookup_path = Path(lookup_osm_data_file)
    if not lookup_path.exists():
        raise RuntimeError(f"Error: lookup_file not found at path {lookup_path}")

    #normal lookup
    lookup_data = open_csv(lookup_path)
    updated_count = 0
    for line in lookup_data:
            loc_id = safe_int_conversion(line['id'])
            osm_id = safe_int_conversion(line['osm_id'])
            osm_type = str(line['osm_type'])
            if osm_id is None: 
                continue
            updated_count += Location.objects.filter(
                id=loc_id,
                osm_id=osm_id
            ).update(
                osm_type=osm_type,
                osm_class=line['osm_class'],
                osm_class_type=line['osm_class_type'],
                display_name=line['display_name']
            )
    print(f"Updated {updated_count} locations with respective osm_type, osm_class, osm_class_type and display_name.")



class Migration(migrations.Migration):

    dependencies = [
        ('location', '0014_add_fields_class_type_display_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='display_name',
            field=models.CharField(blank=True, help_text="Nominatim's full display name of the location", max_length=1024, null=True, verbose_name='Display Name'),
        ),
        migrations.AlterField(
            model_name='location',
            name='osm_class',
            field=models.CharField(blank=True, help_text='The internal class of this location in openstreetmaps', max_length=100, null=True, verbose_name='OSM CLASS'),
        ),
        migrations.AlterField(
            model_name='location',
            name='osm_class_type',
            field=models.CharField(blank=True, help_text='The internal type specifying the osm_class of this location in openstreetmaps', max_length=100, null=True, verbose_name='OSM CLASS TYPE'),
        ),
        migrations.AlterField(
            model_name='location',
            name='osm_type',
            field=models.CharField(blank=True, choices=[('N', 'node'), ('W', 'way'), ('R', 'relation')], help_text='The internal type of this location openstreetmaps', max_length=1, null=True, verbose_name='OSM TYPE'),
        ),
        migrations.RunPython(
            fill_missing_osm_data,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
