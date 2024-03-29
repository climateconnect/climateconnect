# Generated by Django 2.2.11 on 2020-04-07 04:53

from django.db import migrations, models
import django.db.models.deletion
import organization.models.organization


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Organization",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="Points to name of the organization",
                        max_length=1024,
                        verbose_name="Organization",
                    ),
                ),
                (
                    "url_slug",
                    models.CharField(
                        blank=True,
                        help_text="Points to organization url slug",
                        max_length=1024,
                        null=True,
                        verbose_name="URL Slug",
                    ),
                ),
                (
                    "organization_image",
                    models.ImageField(
                        blank=True,
                        help_text="Organization image",
                        null=True,
                        upload_to=organization.models.organization.organization_image_path,
                        verbose_name="Organization Image",
                    ),
                ),
                (
                    "background_image",
                    models.ImageField(
                        blank=True,
                        help_text="Points to background image of an organization",
                        null=True,
                        upload_to=organization.models.organization.organization_background_image_path,
                        verbose_name="Background image",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        help_text="Time when organization was created",
                        verbose_name="Created At",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                        help_text="Time when organization object was updated",
                        verbose_name="Updated At",
                    ),
                ),
                (
                    "parent_organization",
                    models.ForeignKey(
                        blank=True,
                        help_text="Points to parent organization",
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="organization_parent",
                        to="organization.Organization",
                        verbose_name="Parent Organization",
                    ),
                ),
            ],
            options={
                "verbose_name": "Organization",
                "verbose_name_plural": "Organizations",
            },
        ),
    ]
