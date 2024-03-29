# Generated by Django 2.2.13 on 2020-06-23 15:08

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0032_auto_20200623_1143"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="post",
            options={"ordering": ["-id"], "verbose_name": "Post"},
        ),
        migrations.AlterModelOptions(
            name="postcomment",
            options={"ordering": ["-id"], "verbose_name": "Post Comment"},
        ),
        migrations.AlterModelOptions(
            name="projectcomment",
            options={
                "ordering": ["-id"],
                "verbose_name": "Project Comment",
                "verbose_name_plural": "Project Comments",
            },
        ),
    ]
