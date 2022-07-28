from django.db import models

from ideas.models import Idea
from climateconnect_api.models.language import Language


class IdeaTranslation(models.Model):
    idea = models.ForeignKey(
        Idea,
        help_text="Points to idea table",
        verbose_name="Idea",
        related_name="translate_idea",
        on_delete=models.CASCADE,
    )

    language = models.ForeignKey(
        Language,
        help_text="Points to the language idea is translated for",
        verbose_name="Language",
        related_name="translation_language",
        on_delete=models.CASCADE,
    )

    name_translation = models.CharField(
        help_text="Translation of idea's name",
        verbose_name="Name",
        max_length=350,
        null=True,
        blank=True,
    )

    short_description_translation = models.CharField(
        help_text="Translation of idea's summary",
        verbose_name="Summary",
        max_length=5096,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when idea translation was created",
        verbose_name="Created at",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when idea translation was updated",
        verbose_name="Updated at",
        auto_now=True,
    )

    is_manual_translation = models.BooleanField(
        help_text="Was idea translated manually or automatically?",
        verbose_name="Is manual translation?",
        default=False,
    )

    class Meta:
        verbose_name = "Idea translation"
        verbose_name_plural = "Idea translations"

    def __str__(self):
        return "{}: {} tranlsation of {}".format(
            self.id, self.language.name, self.idea.name
        )
