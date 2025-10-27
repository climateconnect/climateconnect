
from django.db import migrations, models
    
class Migration(migrations.Migration):
    dependencies = [
        ("location", "0011_alter_location_exact_address"),
    ]

    operations = [
        migrations.AddField(
            model_name="location",
            name="osm_type",
            field=models.CharField(
                help_text="specifies the osm_type (node/relation/way) of the location",
                verbose_name="OSM TYPE",
                blank=True,
                null=True,
                max_length=1,
            ),
        ),
    ]

