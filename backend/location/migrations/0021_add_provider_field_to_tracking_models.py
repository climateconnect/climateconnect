from django.db import migrations, models


def deduplicate_and_normalize(apps, schema_editor):
    """Handle both fresh DB (bucket_key) and dev DB (minute_key) schemas."""
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'location_nominatimrequestlog'
            AND column_name IN ('bucket_key', 'minute_key')
            """
        )
        columns = {row[0] for row in cursor.fetchall()}

        if "minute_key" in columns:
            cursor.execute(
                "DELETE FROM location_nominatimrequestlog a "
                "USING location_nominatimrequestlog b "
                "WHERE a.minute_key = b.minute_key "
                "AND a.provider = b.provider "
                "AND a.id > b.id"
            )
        elif "bucket_key" in columns:
            cursor.execute(
                "DELETE FROM location_nominatimrequestlog a "
                "USING location_nominatimrequestlog b "
                "WHERE a.bucket_key = b.bucket_key "
                "AND a.id > b.id"
            )
            cursor.execute(
                "ALTER TABLE location_nominatimrequestlog "
                "RENAME COLUMN bucket_key TO minute_key"
            )
            cursor.execute(
                "ALTER TABLE location_nominatimrequestlog "
                "DROP COLUMN IF EXISTS count"
            )
            cursor.execute(
                "ALTER TABLE location_nominatimrequestlog "
                "DROP COLUMN IF EXISTS updated_at"
            )
            cursor.execute(
                "ALTER TABLE location_nominatimrequestlog "
                "ADD COLUMN IF NOT EXISTS processed boolean NOT NULL DEFAULT false"
            )


class Migration(migrations.Migration):
    """
    Add provider field to NominatimRequestLog and NominatimPeriodStats.

    Replaces previous migrations 0021 and 0022. Uses raw SQL for DB
    modifications (handles both fresh and dev schemas) and
    SeparateDatabaseAndState to sync Django's internal state.
    """

    dependencies = [
        ("location", "0019_nominatim_stats"),
    ]

    operations = [
        # --- DB changes ---
        migrations.RunSQL(
            sql=[
                # Drop old constraints/indexes
                "DROP INDEX IF EXISTS location_no_period__0e6c96_idx",
                "ALTER TABLE location_nominatimperiodstats "
                "DROP CONSTRAINT IF EXISTS location_nominatimperiod_period_type_period_key_160dca5b_uniq",
                "ALTER TABLE location_nominatimrequestlog "
                "DROP CONSTRAINT IF EXISTS location_nominatimrequestlog_bucket_key_key",
                "ALTER TABLE location_nominatimrequestlog "
                "DROP CONSTRAINT IF EXISTS location_nominatimrequestlog_minute_key_key",
                # Add provider columns
                "ALTER TABLE location_nominatimperiodstats "
                "ADD COLUMN IF NOT EXISTS provider varchar(20) NOT NULL DEFAULT 'nominatim'",
                "ALTER TABLE location_nominatimrequestlog "
                "ADD COLUMN IF NOT EXISTS provider varchar(20) NOT NULL DEFAULT 'nominatim'",
            ],
            reverse_sql=[],
        ),
        migrations.RunPython(deduplicate_and_normalize, migrations.RunPython.noop),
        migrations.RunSQL(
            sql=[
                # Drop if already exist (idempotent), then create
                "ALTER TABLE location_nominatimperiodstats "
                "DROP CONSTRAINT IF EXISTS location_nominatimperio_period_type_period_key_provider_uniq",
                "ALTER TABLE location_nominatimrequestlog "
                "DROP CONSTRAINT IF EXISTS location_nominatimrequ_minute_key_provider_uniq",
                "ALTER TABLE location_nominatimperiodstats "
                "ADD CONSTRAINT location_nominatimperio_period_type_period_key_provider_uniq "
                "UNIQUE (period_type, period_key, provider)",
                "CREATE INDEX IF NOT EXISTS location_no_period__5a9ac2_idx "
                "ON location_nominatimperiodstats (period_type, period_key, provider)",
                "CREATE INDEX IF NOT EXISTS location_nominatimrequestlog_minute_key_idx "
                "ON location_nominatimrequestlog (minute_key)",
                "CREATE INDEX IF NOT EXISTS location_nominatimrequestlog_provider_idx "
                "ON location_nominatimrequestlog (provider)",
            ],
            reverse_sql=[],
        ),
        # --- State sync (DB already correct above) ---
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(
                    model_name="nominatimrequestlog",
                    name="bucket_key",
                ),
                migrations.RemoveField(
                    model_name="nominatimrequestlog",
                    name="count",
                ),
                migrations.RemoveField(
                    model_name="nominatimrequestlog",
                    name="updated_at",
                ),
                migrations.AddField(
                    model_name="nominatimrequestlog",
                    name="minute_key",
                    field=models.BigIntegerField(
                        default=1, help_text="Epoch minutes (epoch_seconds // 60)"
                    ),
                    preserve_default=False,
                ),
                migrations.AddField(
                    model_name="nominatimrequestlog",
                    name="processed",
                    field=models.BooleanField(default=False),
                ),
                migrations.AddField(
                    model_name="nominatimrequestlog",
                    name="provider",
                    field=models.CharField(
                        choices=[
                            ("nominatim", "Nominatim"),
                            ("locationiq", "LocationIQ"),
                        ],
                        default="nominatim",
                        max_length=20,
                    ),
                ),
            ],
            database_operations=[],
        ),
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveIndex(
                    model_name="nominatimperiodstats",
                    name="location_no_period__0e6c96_idx",
                ),
                migrations.AlterUniqueTogether(
                    name="nominatimperiodstats",
                    unique_together=set(),
                ),
                migrations.AddField(
                    model_name="nominatimperiodstats",
                    name="provider",
                    field=models.CharField(
                        choices=[
                            ("nominatim", "Nominatim"),
                            ("locationiq", "LocationIQ"),
                        ],
                        default="nominatim",
                        max_length=20,
                    ),
                ),
                migrations.AlterUniqueTogether(
                    name="nominatimperiodstats",
                    unique_together={
                        ("period_type", "period_key", "provider"),
                    },
                ),
                migrations.AddIndex(
                    model_name="nominatimperiodstats",
                    index=models.Index(
                        fields=["period_type", "period_key", "provider"],
                        name="location_no_period__5a9ac2_idx",
                    ),
                ),
            ],
            database_operations=[],
        ),
    ]
