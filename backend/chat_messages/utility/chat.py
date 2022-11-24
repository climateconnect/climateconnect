from chat_messages.models.message import Participant, Message


def get_initial_chat_ids_from_user(user):
    return (
        Participant.objects.select_related("chat")
        .filter(user=user, is_active=True)
        .values_list("chat", flat=True)
    )


def filter_chats(chats):
    filtered_chats = chats
    for chat in chats:
        number_of_participants = Participant.objects.filter(
            chat=chat, is_active=True
        ).count()
        if (
            not chat.name
            and not Message.objects.filter(message_participant=chat).exists()
            and number_of_participants == 2
        ):
            filtered_chats = filtered_chats.exclude(id=chat.id)
    return filtered_chats
