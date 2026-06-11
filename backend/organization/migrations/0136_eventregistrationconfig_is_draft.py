from django.db import migrations, models


def set_draft_configs(apps, schema_editor):
    """
    Set is_draft=True for all EventRegistrationConfig records whose
    related Project is still a draft.
    """
    EventRegistrationConfig = apps.get_model("organization", "EventRegistrationConfig")
    EventRegistrationConfig.objects.filter(project__is_draft=True).update(is_draft=True)


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0135_add_devlink_component_to_project"),
    ]

    operations = [
        migrations.AddField(
            model_name="eventregistrationconfig",
            name="is_draft",
            field=models.BooleanField(
                default=False,
                help_text=(
                    "When True, the registration configuration is incomplete and not "
                    "visible to visitors. The organiser can save partial data and publish "
                    "later. May only transition from True to False (one-way)."
                ),
                verbose_name="Is Draft",
            ),
        ),
        migrations.RunPython(set_draft_configs, migrations.RunPython.noop),
    ]
