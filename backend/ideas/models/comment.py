from django.db import models

from organization.models import Comment
from ideas.models import Idea


class IdeaComment(Comment):
    idea = models.ForeignKey(
        Idea,
        help_text="Points to idea table",
        verbose_name="Idea",
        related_name="comment_idea",
        on_delete=models.CASCADE
    )

    class Meta:
        verbose_name = "Idea comment"
        verbose_name_plural = "Idea comments"
    
    def __str__(self):
        return "Comment made to idea: {}".format(self.idea.name)
