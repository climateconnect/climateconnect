# Generated by Django 3.2.15 on 2022-10-04 15:52

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
                ('social_media_name', models.CharField(help_text='Points to name of the social media', max_length=256, verbose_name='Social Media Channel')),
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
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='Time when social media link was created', verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='Time when social media link was updated', verbose_name='Updated At')),
                ('organization', models.ForeignKey(help_text='Points to the social media link', on_delete=django.db.models.deletion.CASCADE, related_name='social_media_link_to_organization', to='organization.organization', verbose_name='Organization for social media')),
                ('social_media_channel', models.ForeignKey(help_text='Points to the social media link', on_delete=django.db.models.deletion.CASCADE, related_name='social_media_link_to_channel', to='climateconnect_api.socialmediachannel', verbose_name='Social Media Channel')),
            ],
            options={
                'verbose_name': 'Social Media Link',
                'verbose_name_plural': 'Social Media Links',
                'unique_together': {('organization', 'social_media_channel')},
            },
        ),
    ]
