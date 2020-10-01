from django.contrib import admin
from chat_messages.models.message import (MessageParticipants, Message, MessageReceiver)

pass_through_models = (MessageParticipants, Message, MessageReceiver)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)