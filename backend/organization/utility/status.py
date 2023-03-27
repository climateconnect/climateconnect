from organization.models import ProjectStatus, ProjectTypes
from climateconnect_main.utility.general import get_prop_in_language


def get_project_status(status: ProjectStatus, language_code: str) -> str:
    return get_prop_in_language(status, "name", language_code)


def get_project_type_name(type: ProjectTypes, language_code: str) -> str:
    return get_prop_in_language(type, "name", language_code)


def get_project_type_helptext(type: ProjectTypes, language_code: str) -> str:
    return get_prop_in_language(type, "help_text", language_code)
