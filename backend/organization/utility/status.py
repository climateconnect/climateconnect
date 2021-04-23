from organization.models import ProjectStatus

def get_project_status(status: ProjectStatus, language_code: str) -> str:
    if language_code == "en":
        return status.name
    else:
        return getattr(status, "name_{}_translation".format(language_code))