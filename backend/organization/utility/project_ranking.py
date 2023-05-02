from typing import Optional
from django.db.models import (
    QuerySet, Count, Value, F, ExpressionWrapper, IntegerField
)
from climateconnect_api.models.user import UserProfile
from organization.models import Project


class ProjectRanking:
    def __init__(self, user_profile: Optional[UserProfile] = None):
        self.user_profile = user_profile
    
    def _project_radmonizer(slef, project: Project, mode: int):
        # Using random.triangular(low, high, mode)
        pass

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
            rank=Value(0)
        ).annotate(
            total_interactions=ExpressionWrapper(
                F('total_likes') + F('total_comments') + F('total_followers'),
                output_field=IntegerField()
            )
        ).order_by('-total_interactions', 'updated_at', 'created_at')

        # ).annotate(
        #     rank=Count(100))
        # ).order_by('updated_at', 'created_at')
        return projects
