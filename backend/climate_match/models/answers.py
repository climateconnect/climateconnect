from django.db import models
from django.contrib.contenttypes.models import ContentType

from climate_match.models import Question


class Answer(models.Model):
	question = models.ForeignKey(
		Question,
		related_name="answer_question",
		help_text="Points to question with predefined answers",
		verbose_name="Question",
		on_delete=models.CASCADE
	)

	text = models.CharField(
		help_text="Answer text",
		verbose_name="Answer",
		max_length=1024
	)

	answer_metadata = models.ManyToManyField(
		'AnswerMetaData',
		help_text="Points to answer metadata table",
		verbose_name="Answer metadata"
	)

	created_at = models.DateTimeField(
		help_text="Time when pre-defined answers were created",
		verbose_name="Created at",
		auto_now_add=True
	)

	updated_at = models.DateTimeField(
		help_text="Time when answer was updated",
		verbose_name="Updated at",
		auto_now=True
	)

	class Meta:
		verbose_name = "Answer"
		verbose_name_plural = "Answers"
	
	def __str__(self):
		return f"{self.id}: {self.question.text} - {self.text}"


class AnswerMetaData(models.Model):
	weight = models.IntegerField(
		help_text="What should be the weight of a resource. Resources may contain projects, ideas, organization etc."
		"This will help us sort projects, ideas, organization etc easily.",
		verbose_name="Weight"
	)

	resource_type = models.ForeignKey(
		ContentType,
		help_text="Points to table that we will be ranking. i.e.: Points to Hubs, Idea, Organization, Project and Skills",
		verbose_name="Resource type",
		on_delete=models.CASCADE
	)

	# We will store reference id if the answer is specific type of resource.
	# For example: For question which skills do you need help with? We will store the skill id that user
	# have selected. If the question is Do you want to do one-off project? yes or no. We would just store
	# resource type "organization" and "project". But not any specific resource id.
	reference_id = models.IntegerField(
		help_text="Points to ID of a reference. Example: Hub ID that user chooses.",
		verbose_name="Reference ID",
		null=True,
		blank=True
	)

	class Meta:
		verbose_name = "Answer metadata"
		verbose_name_plural = "Answer metadata"

	def __str__(self):
		if not self.reference_id:
			return f"Model {self.resource_type.model} has {self.weight} weight"
		else:
			return f"{self.resource_type.model} "\
				f"model object {self.resource_type.get_object_for_this_type(id=self.reference_id)} " \
				f"has {self.weight} weight"
