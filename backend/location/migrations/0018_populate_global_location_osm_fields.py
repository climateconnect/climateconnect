# Generated manually – data migration
# Populates synthetic OSM fields on the existing "Global" and "Unknown" location
# rows so that get_global_location() / get_unknown_location() can look them up
# by OSM composite key without creating duplicates.
# After this migration:
#   Global  → osm_id=-1 / osm_type="R" / osm_class="global"
#   Unknown → osm_id=-2 / osm_type="R" / osm_class="unknown"


from django.db import migrations


def populate_global_location_osm_fields(apps, schema_editor):
    Location = apps.get_model("location", "Location")

    global_locations = Location.objects.filter(name="Global").order_by("id")

    if not global_locations.exists():
        # Nothing to migrate
        return

    # Keep the oldest row as the canonical one; update it with the synthetic fields.
    canonical = global_locations.first()
    canonical.osm_id = -1
    canonical.osm_type = "R"
    canonical.osm_class = "global"
    canonical.osm_class_type = "global"
    canonical.display_name = "Global"
    canonical.save(
        update_fields=["osm_id", "osm_type", "osm_class", "osm_class_type", "display_name"]
    )


def reverse_populate_global_location_osm_fields(apps, schema_editor):
    Location = apps.get_model("location", "Location")

    Location.objects.filter(
        name="Global", osm_id=-1, osm_type="R", osm_class="global"
    ).update(osm_id=None, osm_type=None, osm_class=None, osm_class_type=None, display_name=None)


def populate_unknown_location_osm_fields(apps, schema_editor):
    Location = apps.get_model("location", "Location")

    unknown_locations = Location.objects.filter(name="Unknown").order_by("id")

    if not unknown_locations.exists():
        return

    canonical = unknown_locations.first()
    canonical.osm_id = -2
    canonical.osm_type = "R"
    canonical.osm_class = "unknown"
    canonical.osm_class_type = "unknown"
    canonical.display_name = "Unknown"
    canonical.save(
        update_fields=["osm_id", "osm_type", "osm_class", "osm_class_type", "display_name"]
    )


def reverse_populate_unknown_location_osm_fields(apps, schema_editor):
    Location = apps.get_model("location", "Location")

    Location.objects.filter(
        name="Unknown", osm_id=-2, osm_type="R", osm_class="unknown"
    ).update(osm_id=None, osm_type=None, osm_class=None, osm_class_type=None, display_name=None)


class Migration(migrations.Migration):

    dependencies = [
        ("location", "0017_add_location_lookup_indexes"),
    ]

    operations = [
        migrations.RunPython(
            populate_global_location_osm_fields,
            reverse_populate_global_location_osm_fields,
        ),
        migrations.RunPython(
            populate_unknown_location_osm_fields,
            reverse_populate_unknown_location_osm_fields,
        ),
    ]
