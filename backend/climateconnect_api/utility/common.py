from climateconnect_api.models import Skill
from climateconnect_api.models.role import Role


def get_skill_name(skill: Skill, language_code: str) -> str:
    a = getattr(skill, "name_{}_translation".format(language_code))
    if language_code == "en" or a == None:
        return skill.name
    return a


def get_role_name(role: Role, language_code: str) -> str:
    a = getattr(role, "name_{}_translation".format(language_code))
    if language_code == "en" or a == None:
        return role.name
    return a
