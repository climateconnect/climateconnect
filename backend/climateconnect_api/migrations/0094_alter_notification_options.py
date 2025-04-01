from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('climateconnect_api', '0093_userprofile_restricted_profile'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='notification',
            options={'ordering': ['-created_at'], 'verbose_name_plural': 'Notifications'},
        ),
    ]
