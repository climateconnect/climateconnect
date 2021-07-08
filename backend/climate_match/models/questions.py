from django.db import models
from django.contrib.contenttypes.models import ContentType

from climateconnect_api.models import Language


class Question(models.Model):	
	text = models.CharField(
		help_text="Question text",
		verbose_name="Question",
		max_length=1024
	)

	language = models.ForeignKey(
		Language,
		related_name="question_language",
		help_text="Points to main language",
		verbose_name="Language",
		null=True,
		blank=True,
		on_delete=models.SET_NULL
	)

	answer_type = models.ForeignKey(
		ContentType,
		help_text="Points to a model who's weight should increase. Example: Hubs, Predefined Answer, Skills",
		verbose_name="Answer type",
		null=True,
		blank=True,
		on_delete=models.SET_NULL
	)

	created_at = models.DateTimeField(
		help_text="Time when question was created",
		verbose_name="Created at",
		auto_now_add=True
	)

	updated_at = models.DateTimeField(
		help_text="Time when question was updated",
		verbose_name="Updated at",
		auto_now=True
	)

	class Meta:
		verbose_name = "Question"
		verbose_name_plural = "Questions"
	
	def __str__(self):
		return f"{self.id}: {self.text}"
