from organization.models.sector import Sector


def get_sector_name(sector: Sector, language_code: str) -> str:
    """
    Get the name of the sector in the specified language.
    """
    # skip "en" as this is the default language
    if language_code == "en":
        return sector.name

    lang_translation_column = f"name_{language_code}_translation"

    # check if the translation column exists
    if hasattr(sector, lang_translation_column):
        translation = getattr(sector, lang_translation_column)
        if translation is not None:
            return translation

    # fallback to the default name if translation is not available
    return sector.name
