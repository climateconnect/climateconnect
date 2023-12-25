# Manually created by positiveimpact on 2023-01-18 07:21

from django.db import migrations
from django.contrib.auth.models import Permission, Group

from django.contrib.contenttypes.models import ContentType
from chat_messages.models import MessageParticipants


def add_permission_entry(apps, schema_editor):
    content_type = ContentType.objects.get_for_model(MessageParticipants)
    permission, created = Permission.objects.get_or_create(
        codename="create_unlimited_messageparticipants",
        name="Can Create Unlimited Chats",
        content_type=content_type,
    )
    mod_group = Group.objects.get(name="mod")
    mod_group.permissions.add(permission.id)


def remove_permission_entry(apps, schema_editor):
    content_type = ContentType.objects.get_for_model(MessageParticipants)
    permission = Permission.objects.get(
        codename="create_unlimited_messageparticipants",
        name="Can Create Unlimited Chats",
        content_type=content_type,
    )
    permission.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("chat_messages", "0017_manually_add_mod_group"),
    ]

    operations = [migrations.RunPython(add_permission_entry, remove_permission_entry)]
