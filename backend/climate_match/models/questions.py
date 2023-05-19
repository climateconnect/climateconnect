from django.db import models
from django.contrib.contenttypes.models import ContentType

from climateconnect_api.models import Language


def upload_question_image(instance: "Question", filename: str) -> str:
    return f"climate_match/questions/{instance.id}/{filename}"


class Question(models.Model):
    text = models.CharField(
        help_text="Question text", verbose_name="Question", max_length=1024
    )

    language = models.ForeignKey(
        Language,
        related_name="question_language",
        help_text="Points to main language",
        verbose_name="Language",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    answer_type = models.ForeignKey(
        ContentType,
        help_text="Points to a model who's weight should increase. Example: Hubs, Predefined Answer, Skills",
        verbose_name="Answer type",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    created_at = models.DateTimeField(
        help_text="Time when question was created",
        verbose_name="Created at",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when question was updated",
        verbose_name="Updated at",
        auto_now=True,
    )

    image = models.ImageField(
        help_text="Points to question image",
        verbose_name="Image",
        upload_to=upload_question_image,
        null=True,
        blank=True,
    )

    step = models.IntegerField(
        help_text="At which step should we ask this particular question?",
        verbose_name="Step",
        null=True,
        blank=True,
    )

    # For questions around skills and hubs we need to limit how many answers user can give.
    # This column determines that.
    number_of_choices = models.IntegerField(
        help_text="Number of answer choice user can pick for the question",
        verbose_name="Number of choices",
        null=True,
        blank=True,
    )

    minimum_choices_required = models.IntegerField(
        help_text="How many choices does the user have to select to be able to go forward?",
        verbose_name="Minimum choices required",
        null=True,
        blank=True,
        default=1,
    )

    class Meta:
        verbose_name = "Question"
        verbose_name_plural = "Questions"

    def __str__(self):
        return f"{self.id}: {self.text}"
