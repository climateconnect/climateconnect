from django.db import models

from django.contrib.auth.models import User


class MessageParticipants(models.Model):
    chat_uuid = models.UUIDField(
        help_text="Unique ID for each message connection",
        verbose_name="Chat UUID", unique=True, null=True, blank=True
    )

    participant_one = models.ForeignKey(
        User, related_name="user_participant_one",
        help_text="Points to first participant of the chat",
        verbose_name="Participant One",
        on_delete=models.CASCADE
    )

    participant_two = models.ForeignKey(
        User, related_name="user_participant_two",
        help_text="Points to second participant of the chat",
        verbose_name="Participant Two",
        on_delete=models.CASCADE
    )

    # Making it a bit more future proof.
    # If we introduced a feature to block someone this might come handy.
    is_active = models.BooleanField(
        help_text="Check if the chat between participants are active or not."
                  "If they are not active that means a user has blocked another person.",
        verbose_name="Is active?", default=True
    )

    created_at = models.DateTimeField(
        help_text="Time when participants started a messaging",
        verbose_name="Created at", auto_now_add=True
    )

    deactivated_at = models.DateTimeField(
        help_text="Time when one of the user has deactivated their chat.",
        verbose_name="Deactivated at",
        null=True, blank=True
    )

    class Meta:
        verbose_name_plural = "Message Participants"

    def __str__(self):
        return "Participants: %s => %s" % (
            self.participant_one.username, self.participant_two.username
        )


class Message(models.Model):
    message_participant = models.ForeignKey(
        MessageParticipants, related_name="participant_message",
        help_text="Points to a table where chat was initialized between participants",
        verbose_name="Message participant", null=False, blank=False,
        on_delete=models.CASCADE
    )

    content = models.TextField(
        help_text="Content of a message", verbose_name="Content",
        null=False, blank=False
    )

    sender = models.ForeignKey(
        User, related_name='message_sender',
        help_text="Points to user who sent a message",
        verbose_name="Sender",
        on_delete=models.SET_NULL,
        null=True
    )

    sent_at = models.DateTimeField(
        help_text="Time when message was sent", verbose_name="Sent at",
        null=True, blank=True
    )

    read_at = models.DateTimeField(
        help_text="Time when all participants have read a messages",
        verbose_name='Read at', null=True, blank=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when sender updated a message", verbose_name="Updated at",
        null=True, blank=True
    )

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ["-id"]

    def __str__(self):
        return "%s sent message to participants in this chat %s" % (self.sender.id, self.message_participant_id)
