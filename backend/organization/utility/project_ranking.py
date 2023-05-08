import random
from typing import Dict, Optional
from django.db.models import (
    QuerySet, Count, Value, F, ExpressionWrapper, IntegerField
)
from climateconnect_api.models.user import UserProfile
from organization.models import Project


class ProjectRanking:
    def __init__(self, user_profile: Optional[UserProfile] = None):
        self.user_profile = user_profile
    
    def _project_rank(
            self, total_likes: int, total_comments: int, total_followers: int
        ) -> int:
        total_rank = total_likes + total_comments + total_followers
        # a random number gives a boost to different projects to get the top of the list
        random_number = int(random.triangular(0, 1) * 100)

        a =  ExpressionWrapper(
             total_rank * random_number,
            output_field=IntegerField()
        )
        print(random_number, a)
        return a
    

    # Requirements for project ranking
    # project creation date - order by created_at & updated_at
    # project interaction - number of comments and likes, followers
    # project interaction recenancy - 
    #   1) latest comment - created_at 
    #   2) like based on created_at
    #   3) latest followers
    # project information 
    #   Contains description?
    #   location?
    #   project tags
    #   
    def ranked_projects(self) -> QuerySet[Project]:
        projects = Project.objects.filter(
            is_draft=False, is_active=True,
        ).annotate(
            total_comments=Count('project_comment', distinct=True),
            total_likes=Count('project_liked', distinct=True),
            total_followers=Count('project_following', distinct=True),
        ).annotate(
            rank=self._project_rank(
                total_likes=F('total_likes'),
                total_comments=F('total_comments'),
                total_followers=F('total_followers')
            )
        ).order_by('-rank', 'updated_at', 'created_at')

        # ).annotate(
        #     rank=Count(100))
        # ).order_by('updated_at', 'created_at')
        return projects
