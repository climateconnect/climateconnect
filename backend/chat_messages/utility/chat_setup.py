from datetime import datetime

def set_read(messages):
    unread_messages = messages.filter(read_at=None)
    for message in unread_messages:
        message.read_at = datetime.now()
        message.save()