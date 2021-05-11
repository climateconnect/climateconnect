from climateconnect_api.models.role import Role
from climateconnect_api.models import Skill

def get_skill_name(skill: Skill, language_code: str) -> str:
    if language_code in ["de"]:
        return getattr(skill, "name_{}_translation".format(language_code))
    if language_code == "en":
        return skill.name

def get_role_name(role: Role, language_code: str) -> str:
    if language_code == "en":
        return role.name
    else:
        return getattr(role, "name_{}_translation".format(language_code))