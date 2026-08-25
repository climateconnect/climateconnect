from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("location", "0018_populate_global_location_osm_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="NominatimRequestLog",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "bucket_key",
                    models.BigIntegerField(
                        help_text="Epoch minutes (epoch_seconds // 60)",
                        unique=True,
                    ),
                ),
                (
                    "count",
                    models.PositiveIntegerField(
                        default=0,
                        help_text="Number of Nominatim requests in this minute",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "nominatim request log",
                "verbose_name_plural": "nominatim request logs",
            },
        ),
        migrations.CreateModel(
            name="NominatimPeriodStats",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "period_type",
                    models.CharField(
                        choices=[
                            ("day", "Day"),
                            ("week", "ISO Week"),
                            ("month", "Calendar Month"),
                        ],
                        max_length=5,
                    ),
                ),
                (
                    "period_key",
                    models.CharField(
                        help_text="YYYY-MM-DD, YYYY-Www, or YYYY-MM",
                        max_length=10,
                    ),
                ),
                ("total_requests", models.PositiveIntegerField(default=0)),
                ("avg_req_per_second", models.FloatField(default=0)),
                ("peak_req_per_second", models.FloatField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "nominatim period stats",
                "verbose_name_plural": "nominatim period stats",
            },
        ),
        migrations.AddIndex(
            model_name="nominatimperiodstats",
            index=models.Index(
                fields=["period_type", "period_key"],
                name="location_no_period__0e6c96_idx",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="nominatimperiodstats",
            unique_together={("period_type", "period_key")},
        ),
    ]
