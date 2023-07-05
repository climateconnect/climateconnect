from climateconnect_api.models import Skill
from climateconnect_api.models.role import Role
from django.db import models
from django.utils.text import slugify


def create_unique_slug(name: str, id: int, model_manager: models.Manager):
    url_slug = slugify(name)
    if len(url_slug) == 0:
        url_slug = str(id)
    if model_manager.filter(url_slug=url_slug).exists():
        url_slug = url_slug + str(id)
    return url_slug


def get_skill_name(skill: Skill, language_code: str) -> str:
    lang_translation_attr = "name_{}_translation".format(language_code)
    if hasattr(skill, lang_translation_attr):
        translation = getattr(skill, lang_translation_attr)
        if language_code != "en" and translation is not None:
            return translation
    return skill.name


def get_role_name(role: Role, language_code: str) -> str:
    lang_translation_attr = "name_{}_translation".format(language_code)
    if hasattr(role, lang_translation_attr):
        translation = getattr(role, lang_translation_attr)
        if language_code != "en" and translation is not None:
            return translation
    return role.name
