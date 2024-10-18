from django.db import models

from hubs.models import Hub, HubStat
from climateconnect_api.models.language import Language


class HubTranslation(models.Model):
    hub = models.ForeignKey(
        Hub,
        related_name="translate_hub",
        help_text="Points to Hub table",
        verbose_name="Hub",
        on_delete=models.CASCADE,
    )

    language = models.ForeignKey(
        Language,
        related_name="hub_translate_language",
        help_text="Points to language table",
        verbose_name="Language",
        on_delete=models.CASCADE,
    )

    name_translation = models.CharField(
        help_text="Translation of name column",
        verbose_name="Name translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    headline_translation = models.CharField(
        help_text="Translation of headline column",
        verbose_name="Headline translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    sub_headline_translation = models.CharField(
        help_text="Translation of sub_headline column",
        verbose_name="Sub headline translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    welcome_message_logged_in_translation = models.CharField(
        help_text='Displayed on the dashboard on location hubs when logged in. Starts with "Hi $user.name"',
        verbose_name="Translation of welcome message (logged in)",
        max_length=2048,
        null=True,
        blank=True,
    )

    welcome_message_logged_out_translation = models.CharField(
        help_text="Displayed on the dashboard on location hubs when logged out.",
        verbose_name="Translation of welcome message (logged out)",
        max_length=2048,
        null=True,
        blank=True,
    )

    segway_text_translation = models.TextField(
        help_text="Translation of segway_text column",
        verbose_name="Segway text translation",
        null=True,
        blank=True,
    )

    image_attribution_translation = models.CharField(
        help_text="Translation of image_attribution column",
        verbose_name="Image attribution translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    quick_info_translation = models.TextField(
        help_text="Translation of quick_info column",
        verbose_name="Quick info translation",
        null=True,
        blank=True,
    )

    stat_box_title_translation = models.CharField(
        help_text="Translation of stat_box_title column",
        verbose_name="Stat box title translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "Hub translation"
        verbose_name_plural = "Hub translations"
        unique_together = [["hub", "language"]]

    def __str__(self):
        return "{}: {} translation of hub {}".format(
            self.id, self.language.name, self.hub.name
        )


class HubStatTranslation(models.Model):
    hub_stat = models.ForeignKey(
        HubStat,
        related_name="translation_hub_stat",
        help_text="Points to hub stat table",
        verbose_name="Hub stat",
        on_delete=models.CASCADE,
    )

    language = models.ForeignKey(
        Language,
        related_name="hub_stat_translation_lang",
        help_text="Points to language table",
        verbose_name="Language",
        on_delete=models.CASCADE,
    )

    name_translation = models.CharField(
        help_text="Translation of name column",
        verbose_name="Name translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    value_translation = models.CharField(
        help_text="Translation of value column",
        verbose_name="Value translation",
        max_length=128,
        null=True,
        blank=True,
    )

    value_description_translation = models.CharField(
        help_text="Translation for value_description column",
        verbose_name="Value description translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    description_translation = models.CharField(
        help_text="Translation for description column",
        verbose_name="Stat box description translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    source_name_translation = models.CharField(
        help_text="Translation of source_name column",
        verbose_name="Source name translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "Hub stat translation"
        verbose_name_plural = "Hub stat translations"
        unique_together = [["hub_stat", "language"]]

    def __str__(self):
        return "{}: {} translation for hub stat {}".format(
            self.id, self.language.name, self.hub_stat.name
        )
