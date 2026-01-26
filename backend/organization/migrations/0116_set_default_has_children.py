from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0115_add_parent_project_and_has_children"),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE organization_project ALTER COLUMN has_children SET DEFAULT false;",
            reverse_sql="ALTER TABLE organization_project ALTER COLUMN has_children DROP DEFAULT;",
        ),
    ]
