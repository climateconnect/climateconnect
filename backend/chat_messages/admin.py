from django.contrib import admin
from chat_messages.models.message import (
    MessageParticipants,
    Participant,
    Message,
    MessageReceiver,
)

pass_through_models = (MessageParticipants, Participant, MessageReceiver)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)


class MessageAdmin(admin.ModelAdmin):
    search_fields = [
        "message_participant__id__iexact",
        "sender__first_name__iexact",
        "sender__last_name__iexact",
    ]


admin.site.register(Message, MessageAdmin)
