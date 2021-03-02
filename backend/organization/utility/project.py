from location.utility import get_location
from typing import Dict
from organization.models import Project, ProjectMember
from climateconnect_api.models import (Skill,)
from climateconnect_main.utility.general import get_image_from_data_url

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