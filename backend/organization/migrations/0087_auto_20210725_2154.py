# Generated by Django 2.2.20 on 2021-07-25 21:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0086_membershiprequests'),
    ]

    operations = [
        migrations.AlterField(
            model_name='membershiprequests',
            name='availability',
            field=models.ForeignKey(help_text='Points to the Availability offered by the user', on_delete=django.db.models.deletion.CASCADE, related_name='availabilities', to='climateconnect_api.Availability', verbose_name='requested membership availability'),
        ),
        migrations.AlterField(
            model_name='membershiprequests',
            name='target_organization',
            field=models.ForeignKey(help_text='Points to the requested organization', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='organizations', to='organization.Organization', verbose_name='Target Ogranization of Membership request'),
        ),
        migrations.AlterField(
            model_name='membershiprequests',
            name='target_project',
            field=models.ForeignKey(help_text='Points to the requested project', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='projects', to='organization.Project', verbose_name='Target Project of Membership Request'),
        ),
        migrations.AlterField(
            model_name='membershiprequests',
            name='user',
            field=models.ForeignKey(help_text='Points to the user who sent the request', on_delete=django.db.models.deletion.CASCADE, related_name='users', to=settings.AUTH_USER_MODEL, verbose_name='feedback_user'),
        ),
    ]
