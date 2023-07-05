from hubs.models import Hub, HubStat


def get_hub_attribute(hub: Hub, attribute_name, language_code: str) -> str:
    if (
        hub.language is not None
        and language_code != hub.language.language_code
        and hub.translate_hub.filter(language__language_code=language_code).exists()
    ):
        translation = hub.translate_hub.get(
            language__language_code=language_code, hub=hub
        )
        attribute_translation = getattr(translation, attribute_name + "_translation")
        if attribute_translation and len(attribute_translation) > 0:
            return attribute_translation
    return getattr(hub, attribute_name)


def get_hub_stat_attribute(
    hub_stat: HubStat, attribute_name, language_code: str
) -> str:
    if (
        hub_stat.language is not None
        and language_code != hub_stat.language.language_code
        and hub_stat.translation_hub_stat.filter(
            language__language_code=language_code
        ).exists()
    ):
        translation = hub_stat.translation_hub_stat.get(
            language__language_code=language_code, hub_stat=hub_stat
        )
        attribute_translation = getattr(translation, attribute_name + "_translation")
        if attribute_translation and len(attribute_translation) > 0:
            return attribute_translation
    return getattr(hub_stat, attribute_name)
