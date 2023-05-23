import datetime
import random
from typing import Dict, Optional
from django.db.models import ExpressionWrapper, IntegerField
from climateconnect_api.models.user import UserProfile


class ProjectRanking:
    def __init__(self, user_profile: Optional[UserProfile] = None):
        self.user_profile = user_profile

    def _randomize(self) -> int:
        # a random number gives a boost to different projects to get the top of the list
        return int(random.triangular(1, 100))

    def _weights(self) -> Dict:
        return {
            "total_comments": 0.5,
            "total_likes": 0.5,
            "total_followers": 0.5,
            "last_project_comment": 0.7,
            "last_project_like": 0.8,
            "last_project_follower": 0.9,
            "total_tags": 0.1,
            "location": 0.1,
        }

    def calculate_recency_of_interaction(
        self, last_interaction_timestamp: Optional[datetime.datetime]
    ) -> int:
        if not last_interaction_timestamp:
            return 0

        current_timestamp = datetime.datetime.now().timestamp()
        # recency
        recency = (last_interaction_timestamp - current_timestamp) / (60 * 60 * 24)
        return recency

    def calculate_ranking(
        self,
        location: Optional[int],
        project_id: int,
        total_comments: int,
        total_followers: int,
        total_likes: int,
    ) -> int:
        from organization.models import (
            ProjectComment,
            ProjectLike,
            ProjectTagging,
            ProjectFollower,
        )
        weights = self._weights()

        last_project_comment = (
            ProjectComment.objects.filter(project_id=project_id)
            .order_by("-created_at")
            .last()
        )
        last_project_comment_timestamp = None if not last_project_comment else last_project_comment.created_at.timestamp()
        last_project_like = (
            ProjectLike.objects.filter(project_id=project_id)
            .order_by("-created_at")
            .last()
        )
        last_project_like_timestamp = None if not last_project_like else last_project_like.created_at.timestamp()
        last_project_follower = (
            ProjectFollower.objects.filter(project_id=project_id)
            .order_by("-created_at")
            .last()
        )
        last_project_follower_timestamp = None if not last_project_follower else last_project_follower.created_at.timestamp()

        project_factors = {
            "total_comments": total_comments,
            "total_likes": total_likes,
            "total_followers": total_followers,
            "last_project_comment": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_comment_timestamp
            ),
            "last_project_like": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_like_timestamp
            ),
            "last_project_follower": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_follower_timestamp
            ),
            "total_tags": ProjectTagging.objects.filter(project_id=project_id).count(),
            "location": 1 if location else 0,
        }

        project_rank = int(sum(project_factors[factor] * weights[factor] for factor in weights))
        return project_rank
