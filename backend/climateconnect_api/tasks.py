import logging
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from organization.models.organization import Organization
from climateconnect_api.models.user import UserProfile
from climateconnect_main.celery import app
from climateconnect_api.utility.email_setup import send_weekly_personalized_recommendations_email
from organization.models.project import Project
from hubs.models.hub import Hub
from ideas.models.ideas import Idea
from location.models import Location
from django.contrib.auth.models import User
from django.db.models import Count
from typing import List

logger = logging.getLogger(__name__)


@app.task
def add(a, b):
    logger.info(f"testing.... {a+b}")

@app.task
def schedule_weekly_personalized_recommendations_email():
    max_entities = 3

    # users not in hubs
    new_international_orga = Organization.objects.filter(created_at__gt=(timezone.now() - timedelta(days=7)),).values_list('id', flat = True)[:1:1]
    max_international_projects = max_entities - len(new_international_orga)
    new_international_projects = Project.objects.filter(created_at__gt=(timezone.now() - timedelta(days=7)),).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_international_projects:1] + new_international_entities  
    

    if (new_international_projects | new_international_orga):
        all_users_outside_of_hub = UserProfile.objects.filter(send_newsletter = True).exclude(location__isnull=False, location__hub_location__hub_type = 1)

        for i in range(0, len(all_users_outside_of_hub), settings.USER_CHUNK_SIZE):
            user_ids = [
                u_ids for u_ids in all_users_outside_of_hub[i: i + settings.USER_CHUNK_SIZE]
            ]
            dispatch_weekly_personalized_recommendations_email.apply_async(user_ids, new_international_projects, new_international_orga)


    # users in hubs
    all_locations_in_hubs = list(Location.objects.filter(hub_location__hub_type=1).values_list('id', flat=True).distinct())

    for location_id in all_locations_in_hubs:
        new_orga = Organization.objects.filter(hubs__location__id=location_id, hubs__hub_type=1, created_at__gt=(timezone.now() - timedelta(days=7)),).values_list('id', flat = True)[:1:1]
        new_idea = Idea.objects.filter(hub_shared_in__location__id=location_id, hub_shared_in__hub_type=1, created_at__gt=(timezone.now() - timedelta(days=7)),).values_list('id', flat = True)[:1:1]
        max_projects = max_entities - (len(new_orga) + len(new_idea))
        new_projects = Project.objects.filter(loc__id=location_id, created_at__gt=(timezone.now() - timedelta(days=7)),).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_projects:1]
        
        if (new_projects | new_orga | new_idea):
            all_users_in_hub = UserProfile.objects.filter(send_newsletter=True, location__id = location_id).values_list('user', flat=True)

            for i in range(0, len(all_users_in_hub), settings.USER_CHUNK_SIZE):
                user_ids = [
                    u_ids for u_ids in all_users_in_hub[i: i + settings.USER_CHUNK_SIZE]
                ]
                dispatch_weekly_personalized_recommendations_email.apply_async(user_ids, new_projects, new_orga, new_idea)



@app.task(bind=True)
def dispatch_weekly_personalized_recommendations_email(self, user_ids: List, project_ids: List = [], organization_id = None, idea_id = None):
    for user_id in user_ids:
        user = User.objects.get(user_id)
        projects = []
        for project_id in project_ids:
            projects += Project.objects.get(id=project_id)
        if organization_id:
            organization = Organization.objects.get(id=organization_id)
        if idea_id:
            idea = Idea.objects.get(id=idea_id)
        send_weekly_personalized_recommendations_email(user, projects, organization, idea)