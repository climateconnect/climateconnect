# Generated by Django 3.2.15 on 2022-10-17 09:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0095_auto_20220419_0744'),
        ('climateconnect_api', '0086_auto_20220827_1839'),
    ]

    operations = [
        migrations.CreateModel(
            name='SocialMediaChannel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('social_media_name', models.CharField(default='', help_text='Name of the medium e.g. "Twitter"', max_length=256, verbose_name='Social Media Channel')),
                ('ask_for_full_website', models.BooleanField(default=False, help_text='Checks if user should only provide a handle or full link', verbose_name='Ask For Full Website')),
                ('base_url', models.CharField(default='', help_text='URL of the medium e.g. "https://twitter.com/"', max_length=256, verbose_name='Base URL')),
            ],
            options={
                'verbose_name': 'Social Media Channel',
                'verbose_name_plural': 'Social Media Channels',
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='SocialMediaLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('handle', models.CharField(blank=True, default='', help_text='Handle of the social media, e.g. @ConnectClimate', max_length=256, verbose_name='Social Media Handle')),
                ('url', models.CharField(blank=True, default='', help_text='Full url of the social media e.g. https://twitter.com/ConnectClimate', max_length=256, verbose_name='Social Media URL')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='Time when social media link was created', verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='Time when social media link was updated', verbose_name='Updated At')),
                ('organization', models.ForeignKey(help_text='Points to the organization', on_delete=django.db.models.deletion.CASCADE, related_name='social_media_link_to_organization', to='organization.organization', verbose_name='Organization for social media')),
                ('social_media_channel', models.ForeignKey(help_text='Points to the social media channel', on_delete=django.db.models.deletion.CASCADE, related_name='social_media_link_to_channel', to='climateconnect_api.socialmediachannel', verbose_name='Social Media Channel')),
            ],
            options={
                'verbose_name': 'Social Media Link',
                'verbose_name_plural': 'Social Media Links',
                'unique_together': {('organization', 'social_media_channel')},
            },
        ),
    ]
