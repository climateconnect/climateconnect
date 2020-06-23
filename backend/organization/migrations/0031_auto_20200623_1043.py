# Generated by Django 2.2.13 on 2020-06-23 10:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('climateconnect_api', '0012_auto_20200623_1043'),
        ('organization', '0030_auto_20200620_1239'),
    ]

    operations = [
        migrations.AddField(
            model_name='organizationmember',
            name='role_in_organization',
            field=models.CharField(blank=True, help_text='Points to the role of the person in the organization, e.g.:`Organization Manager`', max_length=1024, null=True, verbose_name='Role in organization'),
        ),
        migrations.AddField(
            model_name='organizationmember',
            name='time_per_week',
            field=models.ForeignKey(blank=True, help_text='Points to availability of a member for the organization', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='org_member_availability', to='climateconnect_api.Availability', verbose_name='Availability'),
        ),
        migrations.AlterField(
            model_name='organizationmember',
            name='role',
            field=models.ForeignKey(help_text='Points ot Role table', on_delete=django.db.models.deletion.PROTECT, related_name='organization_role', to='climateconnect_api.Role', verbose_name='Role(Permissions)'),
        ),
        migrations.AlterField(
            model_name='project',
            name='url_slug',
            field=models.CharField(blank=True, help_text='URL slug for project', max_length=1024, null=True, unique=True, verbose_name='URL slug'),
        ),
    ]
