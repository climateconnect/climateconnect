from typing import (Dict, Optional)
from rest_framework import status
from rest_framework.response import Response
from organization.models import (
    Project, Organization
)
from climateconnect_api.models import (Skill,)

import logging
logger = logging.getLogger(__name__)


def project_creation_pre_checks(data: Dict) -> Optional[Response]:
    required_params = [
        'name', 'status', 'start_date', 'short_description',
        'collaborators_welcome'
    ]
    for param in required_params:
        if param not in data:
            return Response({
                'message': 'Missing required information to create project.'
                           'Please contact administrator'
            }, status=status.HTTP_400_BAD_REQUEST)

    project_status = data['status']
    if project_status not in Project.PROJECT_STATUS_LIST:
        return Response({
            'message': 'Invalid project status'
        }, status=status.HTTP_404_NOT_FOUND)


def create_new_project(data: Dict) -> Project:
    project = Project.objects.create(
        name=data['name'], status=data['status'],
        start_date=data['start_date'], short_description=data['short_description'],
        collaborators_welcome=data['collaborators_welcome']
    )

    # Add all non required parameters if they exists in the request.
    if 'country' in data:
        project.country = data['country']
    if 'city' in data:
        project.city = data['city']
    if 'image' in data:
        project.image = data['image']
    if 'description' in data:
        project.description = data['description']

    project.url_slug = project.name + str(project.id)

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
