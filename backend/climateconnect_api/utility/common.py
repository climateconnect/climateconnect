from climateconnect_api.models import Skill
from climateconnect_api.models.role import Role


def get_skill_name(skill: Skill, language_code: str) -> str:
    lang_translation_attr = "name_{}_translation".format(language_code)
    if hasattr(skill, lang_translation_attr):
        translation = getattr(skill, lang_translation_attr)
        if language_code != "en" and translation != None:
            return translation
    return skill.name


def get_role_name(role: Role, language_code: str) -> str:
    lang_translation_attr = "name_{}_translation".format(language_code)
    if hasattr(role, lang_translation_attr):
        translation = getattr(role, lang_translation_attr)
        if language_code != "en" and translation != None:
            return translation
    return role.name