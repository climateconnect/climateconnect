from django.contrib import admin
from chat_messages.models.message import (MessageParticipants, Message)

pass_through_models = (MessageParticipants, Message)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)