from django.db import models


class FaqSection(models.Model):
    name = models.CharField(
        help_text="Points to section name. Each section has its own tab on the FAQ page",
        verbose_name="Name",
        max_length=128,
    )

    is_on_about_page = models.BooleanField(
        help_text="Identifies the section that should be shown on the about page faq section",
        verbose_name="Is shown on about page",
        default=False,
    )

    name_de_translation = models.CharField(
        help_text="Translation of name field in deutsch",
        verbose_name="Name DE translation",
        max_length=128,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when skill was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when skill was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    rating = models.PositiveSmallIntegerField(
        help_text="The larger the number, the more to the top this section will be displayed",
        verbose_name="Rating (1-100)",
        default=1,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Faq Section"
        verbose_name_plural = "Faq Sections"
        ordering = ["-rating"]

    def __str__(self):
        return "Section: %s" % (self.name)


class FaqQuestion(models.Model):
    section = models.ForeignKey(
        FaqSection,
        related_name="question_section",
        verbose_name="Section/Tab",
        help_text="Points to the section this question belongs to",
        on_delete=models.CASCADE,
    )

    question = models.TextField(
        verbose_name="Question",
        help_text="The question text",
    )

    # Other language translations need to fit this template field
    # question_<language code>_translation e.g. question_fr_translation
    # Same goes for the answer and section name see line 11
    question_de_translation = models.TextField(
        help_text="Deutsch translation of question column",
        verbose_name="Question DE translation",
        null=True,
        blank=True,
    )

    answer = models.TextField(
        help_text="The answer text",
        verbose_name="Answer",
    )

    answer_de_translation = models.TextField(
        help_text="Deutsch translation of answer column",
        verbose_name="Answer DE translation",
        null=True,
        blank=True,
    )

    rating = models.PositiveSmallIntegerField(
        help_text="The larger the number, the more to the top this question will be displayed",
        verbose_name="Rating (1-100)",
        default=1,
    )

    created_at = models.DateTimeField(
        help_text="Time when skill was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when skill was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Faq Question"
        verbose_name_plural = "Faq Questions"
        db_table = "climateconnect_faq"
        ordering = ["-rating"]

    def __str__(self):
        return "Question: %s" % (self.question)
