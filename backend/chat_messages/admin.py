from django.contrib import admin
from chat_messages.models.message import (
    MessageParticipants,
    Participant,
    Message,
    MessageReceiver,
)

pass_through_models = (MessageParticipants, Participant, Message, MessageReceiver)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)
