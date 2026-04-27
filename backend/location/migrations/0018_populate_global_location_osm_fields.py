# Generated manually – data migration
# Populates synthetic OSM fields on the existing "Global" location row so that
# get_global_location() can look it up by OSM composite key without creating a
# duplicate.  After this migration there will be one "Global" row and it
# will carry osm_id=-1 / osm_type="R" / osm_class="global".


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


class Migration(migrations.Migration):

    dependencies = [
        ("location", "0017_add_location_lookup_indexes"),
    ]

    operations = [
        migrations.RunPython(
            populate_global_location_osm_fields,
            reverse_populate_global_location_osm_fields,
        ),
    ]
