# Manually created by positiveimpact on 2023-01-18 07:26

from django.db import migrations
from django.contrib.auth.models import Group

def add_group_entry(apps, schema_editor):
  Group.objects.get_or_create(name='mod')

def remove_group_entry(apps, schema_editor):
  group = Group.objects.get(name='mod')
  group.delete()

class Migration(migrations.Migration):

    dependencies = [
        ('chat_messages', '0016_messageparticipants_created_by'),
    ]

    operations = [
        migrations.RunPython(add_group_entry, remove_group_entry)
    ]
