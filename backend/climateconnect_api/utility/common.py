from climateconnect_api.models import Skill

def get_skill_name(skill: Skill, language_code: str) -> str:
    if language_code == "en":
        return skill.name
    else:
        return getattr(skill, "name_{}_translation".format(language_code))