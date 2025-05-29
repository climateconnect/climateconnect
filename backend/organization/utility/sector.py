from organization.models.sector import Sector
from typing import Any, Tuple, Optional


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


def senatize_sector_inputs(inputs: Any) -> Tuple[Any, Optional[Exception]]:
    """
    Process the inputs and return a tuple: (result, error).
    On success, error is None

    On failure, result is None, and the error holds the exception.


    result is an error of strings
    """
    if isinstance(inputs, str):
        inputs = inputs.strip()
        if "," in inputs:
            inputs = inputs.split(",")
        elif ";" in inputs:
            inputs = inputs.split(";")
        else:
            inputs = [inputs]

    if isinstance(inputs, list):
        for item in inputs:
            if not isinstance(item, str):
                return None, ValueError("All items in the list must be strings.")
    else:
        return None, ValueError("Unsupported input type. Expected str or list of str.")

    # remove duplicates
    inputs = list(set(inputs))
    return inputs, None
