from typing import Optional
from organization.models import ProjectStatus


def get_project_status(status: ProjectStatus, language_code: str) -> Optional[str]:
    lang_translation_attr = "name_{}_translation".format(language_code)
    if hasattr(status, lang_translation_attr):
        translation = getattr(status, lang_translation_attr)
        if language_code != "en" and translation is not None:
            return translation
    return status.name
