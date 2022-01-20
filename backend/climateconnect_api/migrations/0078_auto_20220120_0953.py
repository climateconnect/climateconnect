# Generated by Django 2.2.24 on 2022-01-20 09:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0095_auto_20220113_1027'),
        ('climateconnect_api', '0077_merge_20211213_1307'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='post_like',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notification_post_like', to='organization.Like', verbose_name='Post Like'),
        ),
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.IntegerField(choices=[(0, 'broadcast'), (1, 'private_message'), (2, 'project_comment'), (3, 'reply_to_project_comment'), (4, 'project_follower'), (5, 'project_update_post'), (6, 'post_comment'), (7, 'reply_to_post_comment'), (8, 'group_message'), (9, 'mention'), (10, 'project_like'), (11, 'idea_comment'), (12, 'reply_to_idea_comment'), (13, 'person_joined_idea'), (14, 'post_like')], default=0, help_text='type of notification', verbose_name='Notification type'),
        ),
    ]
