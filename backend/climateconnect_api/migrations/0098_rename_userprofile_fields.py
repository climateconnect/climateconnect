from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('climateconnect_api', '0097_userprofilesectormapping'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userprofilesectormapping',
            old_name='userProfile',
            new_name='user_profile',
        ),
        migrations.AlterModelOptions(
            name='userprofilesectormapping',
            options={
                'ordering': ['id'],
                'verbose_name': 'UserProfile Sector Mapping',
            },
        ),
    ]
