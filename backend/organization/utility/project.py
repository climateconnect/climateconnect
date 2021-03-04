from django.db.models import Q
from location.utility import get_location
from typing import Dict
from organization.models import Project, ProjectMember
from climateconnect_api.models import (Skill,)
from climateconnect_main.utility.general import get_image_from_data_url
from climateconnect_api.models import Role

import logging
logger = logging.getLogger(__name__)


def create_new_project(data: Dict) -> Project:
    project = Project.objects.create(
        name=data['name'],
        short_description=data['short_description'],
        collaborators_welcome=data['collaborators_welcome'],
        status_id = data['status']
    )
    # Add all non required parameters if they exists in the request.
    if 'start_date' in data:
        project.start_date = data['start_date']
    if 'loc' in data:
        location = get_location(data['loc'])
        project.loc = location
    if 'country' in data:
        project.country = data['country']
    if 'city' in data:
        project.city = data['city']
    if 'image' in data:
        project.image = get_image_from_data_url(data['image'])[0]
    if 'thumbnail_image' in data:
        project.thumbnail_image = get_image_from_data_url(data['thumbnail_image'])[0]
    if 'description' in data:
        project.description = data['description']
    if 'end_date' in data:
        project.end_date = data['end_date']
    if 'helpful_connections' in data:
        project.helpful_connections = data['helpful_connections']
    if 'is_draft' in data:
        project.is_draft = data['is_draft']
    if 'website' in data:
        project.website = data['website']

    project.url_slug = project.name.replace(" ", "") + str(project.id)

    if 'skills' in data:
        for skill_id in data['skills']:
            try:
                skill = Skill.objects.get(id=int(skill_id))
                project.skills.add(skill)
            except Skill.DoesNotExist:
                logger.error("Passed skill ID {} does not exists".format(skill_id))
                continue

    project.save()
    return project

def add_project_member(project,user,user_role,role_in_project,availability):
    """
    Adds a user to a project. Assumes valid data at input.


    """

    ProjectMember.objects.create(
                        project=project
                        ,user=user
                        ,role=user_role
                        ,role_in_project=role_in_project
                        ,availability=availability
                    )
    return 


def get_project_admin_creators(project,limit_to_admins=False):
    """
    Returns a given project UserProfiles of Creators or Administrators. if limit_to_admins is set to True, only admins will be returned.
    :param project: target project 
    :type project: Project 
    :param limit_to_admins: limit output to admins only 
    :ype limit_to_amins: bool
    """
    targets_roles = Role.objects.filter(Q(name="Creator") | Q(name="Administrator")).all()
    if targets_roles.count() < 1: raise Exception(f"Project does not have any Admins! {targets_roles}")  
    admin_role, creator_role = targets_roles.filter(name="Administrator").first(), targets_roles.filter(name="Creator").first()

    role_sub_query = Q(role=admin_role) if limit_to_admins else (Q(role=admin_role) | Q(role=creator_role))
    query =  Q(project=project) & role_sub_query
    
    admins = ProjectMember.objects.filter(query) 

    return [u.user for u in admins.all()]

        