from hubs.models.hub import Hub
from organization.models.sector import (
    OrganizationSectorMapping,
    ProjectSectorMapping,
    Sector,
)
from typing import Any, List, Tuple, Optional, Union


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


def sanitize_sector_inputs(inputs: Any) -> Tuple[Any, Optional[Exception]]:
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

    # remove duplicates while keeping the order
    # start from the last item.
    # if it is contained in the previous elements, remove it form the list
    i = len(inputs) - 1
    while i >= 0:
        s = inputs[i]
        if s in inputs[:i]:
            inputs = inputs[:i] + inputs[i + 1 :]  # remove the current item
        i -= 1

    inputs = [item.strip() for item in inputs if item.strip()]
    inputs = [item for item in inputs if len(item) > 0]
    return inputs, None


def __substitute_sector(mapping):
    """
    Substitute the sector mapping with the related sector if it exists
    keep the order of the mapping.

    if the mapping is an OrganizationSectorMapping, return an OrganizationSectorMapping
    if the mapping is a ProjectSectorMapping, return a ProjectSectorMapping
    If the mapping is neither, raise a ValueError.
    """
    order = mapping.order
    if isinstance(mapping, OrganizationSectorMapping):
        return OrganizationSectorMapping(
            sector=mapping.sector.relates_to_sector, order=order
        )
    elif isinstance(mapping, ProjectSectorMapping):
        return ProjectSectorMapping(
            sector=mapping.sector.relates_to_sector, order=order
        )

    raise ValueError("Invalid mapping type.")


def filter_and_substitue_sector_mapping_based_on_hub_or_defaults(
    sector_mappings: List[Union[ProjectSectorMapping, OrganizationSectorMapping]],
    hub: Hub | None,
) -> List[Union[ProjectSectorMapping, OrganizationSectorMapping]]:
    """
    Filter the sector mappings based on the hub or default sectors.
    If the hub is None, return all mappings that are default or relate to a default sector.
    Otherwise, return only the sector mappings (including possible substitutions)
    """
    valid_sectors = hub.sectors.all() if hub else None
    sector_mappings = []

    for mapping in sector_mappings:
        mappingToAppend = None

        if valid_sectors and mapping.sector in valid_sectors:
            # if the sector is valid, add it to the list
            mappingToAppend = mapping

        elif valid_sectors and mapping.sector.relates_to_sector in valid_sectors:
            mappingToAppend = __substitute_sector(mapping)

        elif not valid_sectors and mapping.sector.default_sector:
            # add if the sector is default or relates to a default sector
            mappingToAppend = mapping

        elif (
            not valid_sectors
            and mapping.sector.relates_to_sector
            and mapping.sector.relates_to_sector.default_sector
        ):
            # if the related one is default, substitute it
            mappingToAppend = __substitute_sector(mapping)

        # avoid duplicates
        if mappingToAppend and all(
            m.sector != mappingToAppend.sector for m in sector_mappings
        ):
            sector_mappings.append(mappingToAppend)

    return sector_mappings
