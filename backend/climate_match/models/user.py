from django.db import models
from django.contrib.auth.models import User

from climate_match.models import Question, Answer, AnswerMetaData


class UserQuestionAnswer(models.Model):
    user = models.ForeignKey(
        User,
        related_name="user_qna",
        help_text="Points user who answered questions",
        verbose_name="User",
        on_delete=models.CASCADE
    )

    question = models.ForeignKey(
        Question,
        related_name="user_question",
        help_text="Points to question we ask users",
        verbose_name="Question",
        on_delete=models.CASCADE
    )

    # If user is answering for a question that has predefined answers we will add predefined answer foreign key
    # Otherwise this column will be empty.
    predefined_answer = models.ForeignKey(
        Answer,
        related_name="user_predefined_answer",
        help_text="Points to predefined answers we show customers",
        verbose_name="Predefined Answer",
        on_delete=models.CASCADE,
        null=True, blank=True
    )

    # If user is answering for a question that has no defined answer we will created those answer and store them
    # as many to many relationship.
    answers = models.ManyToManyField(
        AnswerMetaData,
        help_text="Points choices that user made.",
        verbose_name="Answers",
        related_name="user_ans_metadata",
        blank=True
    )

    created_at = models.DateTimeField(
        help_text="Time when user first answered question.",
        verbose_name="Created at",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when user updated their answer",
        verbose_name="Updated at",
        auto_now=True
    )

    class Meta:
        verbose_name = "User question answer"
        verbose_name_plural = "User question answers"

    def __str__(self):
        return f"{self.user.first_name} answered question {self.question.text}"