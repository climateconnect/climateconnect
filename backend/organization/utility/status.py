from organization.models import ProjectStatus


def get_project_status(status: ProjectStatus, language_code: str) -> str:
    a = getattr(status, "name_{}_translation".format(language_code))
    if language_code == "en" or a == None:
        return status.name
    return a
