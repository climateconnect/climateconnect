from hubs.models.hub import Hub
from organization.models.sector import (
    OrganizationSectorMapping,
    ProjectSectorMapping,
    Sector,
    UserProfileSectorMapping,
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


def __substitute_sector_in_mapping(
    mapping: Union[ProjectSectorMapping, OrganizationSectorMapping, UserProfileSectorMapping],
) -> Union[ProjectSectorMapping, OrganizationSectorMapping, UserProfileSectorMapping]:
    """
    Substitute the sector mapping with the related sector if it exists
    keep the order of the mapping.

    if the mapping is an OrganizationSectorMapping, return an OrganizationSectorMapping
    if the mapping is a ProjectSectorMapping, return a ProjectSectorMapping
    if the mapping is a UserProfileSectorMapping, return a UserProfileSectorMapping
    If the mapping is neither, raise a ValueError.
    """
    order = mapping.order
    if isinstance(mapping, OrganizationSectorMapping):
        return OrganizationSectorMapping(
            sector=mapping.sector.relates_to_sector, order=order
        )
    elif isinstance(mapping, ProjectSectorMapping):
        return ProjectSectorMapping(
            project=mapping.project,
            sector=mapping.sector.relates_to_sector,
            order=order,
        )
    elif isinstance(mapping, UserProfileSectorMapping):
        return UserProfileSectorMapping(
            user_profile=mapping.user_profile,
            sector=mapping.sector.relates_to_sector,
            order=order,
        )

    raise ValueError("Invalid mapping type.")


def get_sectors_based_on_hub(
    sector_mappings: List[
        Union[ProjectSectorMapping, OrganizationSectorMapping, UserProfileSectorMapping]
    ],
    hub: Hub | None,
) -> List[
    Union[ProjectSectorMapping, OrganizationSectorMapping, UserProfileSectorMapping]
]:
    """
    Filter the sector mappings based on the hub or default sectors.
    If the hub is None, return all mappings that are default or relate to a default sector.
    Otherwise, return only the sector mappings (including possible substitutions)
    """
    valid_sectors = hub.sectors.all() if hub else None
    filtered_mappings = []
    seen_sectors = set()

    for mapping in sector_mappings:
        # assigments
        mapping_to_append = None
        # current sector
        sector = mapping.sector
        related_sector = sector.relates_to_sector
        substituted = __substitute_sector_in_mapping(mapping)

        # always display a default sector
        if sector.default_sector:
            mapping_to_append = mapping

        # show hub specific sectors
        elif valid_sectors and sector in valid_sectors:
            mapping_to_append = mapping

        # show related sectors, if they are default sectors
        elif related_sector and related_sector.default_sector:
            mapping_to_append = substituted

        # show related sectors, if they are specific sectors for this hub
        elif related_sector and valid_sectors and related_sector in valid_sectors:
            mapping_to_append = substituted

        # append, while avoiding duplicates
        if mapping_to_append and mapping_to_append.sector not in seen_sectors:
            seen_sectors.add(mapping_to_append.sector)
            filtered_mappings.append(mapping_to_append)

    return filtered_mappings


def create_context_for_hub_specific_sector(
    request: Any,
) -> Optional[dict[str, Any]]:
    """
    Create a context for the hub specific sector.
    """
    if "hub" in request.query_params:
        hub = (
            Hub.objects.filter(url_slug=request.query_params["hub"])
            .prefetch_related("sectors")
            .first()
        )
        if not hub:
            return {}
        return {
            "hub": hub,
        }
    return {}
