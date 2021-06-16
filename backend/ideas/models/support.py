from django.db import models
from django.contrib.auth.models import User

from ideas.models import Idea


class IdeaRating(models.Model):
    idea = models.ForeignKey(
        Idea,
        help_text="Points to idea table",
        verbose_name="Idea",
        related_name="rating_idea",
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        User,
        help_text="Points to user who rated the idea",
        verbose_name="User",
        related_name="user_rated",
        on_delete=models.CASCADE
    )

    rating = models.PositiveSmallIntegerField(
        help_text="Rating for each idea by users",
        verbose_name="Rating",
        default=100
    )

    created_at = models.DateTimeField(
        help_text="Time when rating was given to the idea",
        verbose_name="Created at",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when user updated their rating for an idea",
        verbose_name="Updated at",
        auto_now=True
    )

    class Meta:
        verbose_name = "Idea rating"
        verbose_name_plural = "Idea ratings"
    

    def __str__(self):
        return "{} rated {} for idea {}".format(
            self.user.first_name, self.rating, self.idea.name
        )


class IdeaSupporter(models.Model):
    user = models.ForeignKey(
        User,
        help_text="Points to user who supported the idea",
        verbose_name="User",
        related_name="supporter_user",
        on_delete=models.CASCADE
    )

    idea = models.ForeignKey(
        Idea,
        help_text="Points to idea supported by user",
        verbose_name="Idea",
        related_name="supported_idea",
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        help_text="Time when user supported the idea",
        verbose_name="Created at",
        auto_now_add=True
    )

    class Meta:
        verbose_name = "Idea supporter"
        verbose_name_plural = "Idea supporters"
    
    def __str__(self):
        return "{} supported idea {}".format(
            self.user.first_name, self.idea.name
        )
