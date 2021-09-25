from django.db import models
from climateconnect_api.models import Language
from climate_match.models import Question, Answer


class QuestionTranslation(models.Model):
    question = models.ForeignKey(
        Question,
        related_name="translate_question",
        help_text="Points to question that will be translated",
        verbose_name="Question",
        on_delete=models.CASCADE
    )

    language = models.ForeignKey(
        Language,
        help_text="Points to a language we will translate question to",
        verbose_name="Language",
        on_delete=models.CASCADE
    )

    text = models.CharField(
        help_text="Translated text for the question",
        verbose_name="Text",
        max_length=1024
    )

    created_at = models.DateTimeField(
        help_text="Time when question was first translated",
        verbose_name="Created at",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when question was updated",
        verbose_name="Updated at",
        auto_now=True
    )

    class Meta:
        verbose_name = "Question translation"
        verbose_name_plural = "Question translations"

    def __str__(self):
        return f"'{self.question.text}' (translated in {self.language.name})"


class AnswerTranslation(models.Model):
    answer = models.ForeignKey(
        Answer,
        related_name="translate_answer",
        help_text="Points to answer translation",
        verbose_name="Answer",
        on_delete=models.CASCADE
    )

    language = models.ForeignKey(
        Language,
        help_text="Points to a language we will translate answer to",
        verbose_name="Language",
        on_delete=models.CASCADE
    )

    text = models.CharField(
        help_text="Translated text for answers",
        verbose_name="Text",
        max_length=1024
    )

    created_at = models.DateTimeField(
        help_text="Time when answer was first translated",
        verbose_name="Created at",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when answer was updated",
        verbose_name="Updated at",
        auto_now=True
    )

    class Meta:
        verbose_name = "Answer translation"
        verbose_name_plural = "Answer translations"

    def __str__(self):
        return f"'{self.answer.text}' (translated in {self.language.name})"
