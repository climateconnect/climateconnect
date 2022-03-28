import logging
from typing import Dict

from climateconnect_api.models import Skill
from climateconnect_api.models.language import Language
from climateconnect_api.utility.translation import get_translations
from climateconnect_main.utility.general import get_image_from_data_url
from location.utility import get_location
from climateconnect_api.utility.common import create_unique_slug

from organization.models import Project
from organization.models.tags import ProjectTags

logger = logging.getLogger(__name__)


def create_new_project(data: Dict, source_language: Language) -> Project:
    project = Project.objects.create(
        name=data['name'],
        short_description=data['short_description'],
        collaborators_welcome=data['collaborators_welcome'],
        status_id=data['status']
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
        project.thumbnail_image = get_image_from_data_url(
            data['thumbnail_image'])[0]
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
    project.language = source_language

    project.url_slug = create_unique_slug(project.name, project.id, Project.objects)
    
    if 'skills' in data:
        for skill_id in data['skills']:
            try:
                skill = Skill.objects.get(id=int(skill_id))
                project.skills.add(skill)
            except Skill.DoesNotExist:
                logger.error(
                    "Passed skill ID {} does not exists".format(skill_id))
                continue
    project.save()
    return project


def get_project_helpful_connections(project: Project, language_code: str) -> str:
    if language_code != project.language.language_code and \
            project.translation_project.filter(language__language_code=language_code).exists():
        return project.translation_project.get(
            language__language_code=language_code
        ).helpful_connections_translation

    return project.helpful_connections


def get_project_name(project: Project, language_code: str) -> str:
    if project.language and language_code != project.language.language_code and \
            project.translation_project.filter(language__language_code=language_code).exists():
        return project.translation_project.get(
            language__language_code=language_code
        ).name_translation

    return project.name


def get_project_short_description(project: Project, language_code: str) -> str:
    if project.language and language_code != project.language.language_code and \
            project.translation_project.filter(language__language_code=language_code).exists():
        return project.translation_project.get(
            language__language_code=language_code
        ).short_description_translation

    return project.short_description


def get_project_description(project: Project, language_code: str) -> str:
    if language_code != project.language.language_code and \
            project.translation_project.filter(language__language_code=language_code).exists():
        return project.translation_project.get(
            language__language_code=language_code
        ).description_translation

    return project.description


def get_projecttag_name(tag: ProjectTags, language_code: str) -> str:
    lang_translation_attr = "name_{}_translation".format(language_code)
    if hasattr(tag, lang_translation_attr):
        translation = getattr(tag, lang_translation_attr)
        if language_code != "en" and translation != None:
            return translation
    return tag.name


def get_project_translations(data: Dict):
    texts = {
        'name': data['name'],
        'short_description': data['short_description']
    }
    if 'description' in data:
        texts['description'] = data['description']
    if 'helpful_connections' in data:
        texts['helpful_connections'] = data['helpful_connections']
    try:
        return get_translations(
            texts,
            data['translations'],
            data['source_language']
        )
    except ValueError:
        raise ValueError
