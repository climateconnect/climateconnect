# Generated by Django 2.2.20 on 2021-07-02 07:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("hubs", "0011_auto_20210505_2011"),
        ("ideas", "0015_ideatranslation_is_manual_translation"),
    ]

    operations = [
        migrations.AddField(
            model_name="idea",
            name="hub_shared_in",
            field=models.ForeignKey(
                blank=True,
                help_text="Points to the (location)hub the idea was shared in",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="idea_hub_shared_in",
                to="hubs.Hub",
                verbose_name="(Location-)Hub where idea was shared",
            ),
        ),
    ]
