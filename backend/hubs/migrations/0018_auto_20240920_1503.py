# Generated by Django 3.2.18 on 2024-09-20 15:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hubs', '0017_hub_custom_footer_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='hub',
            name='welcome_message_logged_in',
            field=models.CharField(blank=True, help_text='Displayed on the dashboard on location hubs when logged in. Starts with "Hi $user.name"', max_length=2048, null=True, verbose_name='Welcome message (logged in)'),
        ),
        migrations.AddField(
            model_name='hub',
            name='welcome_message_logged_out',
            field=models.CharField(blank=True, help_text='Displayed on the dashboard on location hubs when logged out.', max_length=2048, null=True, verbose_name='Welcome message (logged out)'),
        ),
        migrations.AddField(
            model_name='hubtranslation',
            name='welcome_message_logged_in_translation',
            field=models.CharField(blank=True, help_text='Displayed on the dashboard on location hubs when logged in. Starts with "Hi $user.name"', max_length=2048, null=True, verbose_name='Translation of welcome message (logged in)'),
        ),
        migrations.AddField(
            model_name='hubtranslation',
            name='welcome_message_logged_out_translation',
            field=models.CharField(blank=True, help_text='Displayed on the dashboard on location hubs when logged out.', max_length=2048, null=True, verbose_name='Translation of welcome message (logged out)'),
        ),
    ]