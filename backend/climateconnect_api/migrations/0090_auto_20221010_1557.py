# Generated by Django 3.2.15 on 2022-10-10 15:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0095_auto_20220419_0744'),
        ('climateconnect_api', '0089_auto_20221007_0916'),
    ]

    operations = [
        migrations.AddField(
            model_name='socialmediachannel',
            name='key',
            field=models.PositiveSmallIntegerField(default=0, help_text='Key of the social media link', verbose_name='Social Media Key'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='socialmediachannel',
            name='social_media_name',
            field=models.CharField(default='', help_text='Link of the social media', max_length=256, verbose_name='Social Media Channel'),
        ),
        migrations.AlterField(
            model_name='socialmedialink',
            name='organization',
            field=models.ForeignKey(help_text='Points to the organization', on_delete=django.db.models.deletion.CASCADE, related_name='social_media_link_to_organization', to='organization.organization', verbose_name='Organization for social media'),
        ),
        migrations.AlterField(
            model_name='socialmedialink',
            name='social_media_channel',
            field=models.ForeignKey(help_text='Points to the social media channel', on_delete=django.db.models.deletion.CASCADE, related_name='social_media_link_to_channel', to='climateconnect_api.socialmediachannel', verbose_name='Social Media Channel'),
        ),
    ]
