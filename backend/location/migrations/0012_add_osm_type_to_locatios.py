
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
                help_text="The internal osm_type of this location openstreetmaps",
                verbose_name="OSM TYPE",
                choices=[('N', 'node'), ('W', 'way'), ('R', 'relation')],
                blank=True,
                null=True,
                max_length=1,
            ),
        ),
    ]

