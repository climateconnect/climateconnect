from django.db import models


class Language(models.Model):
    name = models.CharField(
        max_length=512, help_text="Name of a language", verbose_name="Name"
    )

    native_name = models.CharField(
        max_length=512,
        help_text="Name of language in their native tounge. e.g: German -> Deutsch",
        verbose_name="Native name",
        null=True,
        blank=True,
    )

    language_code = models.CharField(
        max_length=8,
        help_text="Short form or Code for each language. e.g.: German/Deutsch has code de",
        verbose_name="Language Code",
        unique=True,
    )

    date_format = models.CharField(
        max_length=12,
        help_text="Format of the date for different countries",
        verbose_name="Date Format",
        null=True,
        blank=True,
    )

    currency = models.CharField(
        max_length=32,
        help_text="Currency of each country",
        verbose_name="Currency",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Time when language was created",
        verbose_name="Created at",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Time when language object was updated",
        verbose_name="Updated at",
    )

    class Meta:
        verbose_name_plural = "Languages"

    def __str__(self):
        return "{}: {}".format(self.language_code, self.name)
