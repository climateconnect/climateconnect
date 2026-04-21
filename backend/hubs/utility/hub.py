from hubs.models import Hub, HubStat, HubSupporter


def get_hub_attribute(hub: Hub, attribute_name, language_code: str) -> str:
    if hub.language is not None and language_code != hub.language.language_code:
        for translation in hub.translate_hub.all():
            if translation.language.language_code == language_code:
                attribute_translation = getattr(
                    translation, attribute_name + "_translation"
                )
                if attribute_translation and len(attribute_translation) > 0:
                    return attribute_translation
    return getattr(hub, attribute_name)


def get_hub_stat_attribute(
    hub_stat: HubStat, attribute_name, language_code: str
) -> str:
    if (
        hub_stat is not None
        and hub_stat.language is not None
        and language_code != hub_stat.language.language_code
    ):
        for translation in hub_stat.translation_hub_stat.filter(
            language__language_code=language_code
        ):
            attribute_translation = getattr(
                translation, attribute_name + "_translation"
            )
            if attribute_translation and len(attribute_translation) > 0:
                return attribute_translation
    return getattr(hub_stat, attribute_name)


def get_hub_supporter_attribute(
    hub_supporter: HubSupporter, attribute_name, language_code: str
) -> str:
    if (
        hub_supporter is not None
        and hub_supporter.language is not None
        and language_code != hub_supporter.language.language_code
    ):
        for translation in hub_supporter.translate_hub_supporter.filter(
            language__language_code=language_code
        ):
            attribute_translation = getattr(
                translation, attribute_name + "_translation"
            )
            if attribute_translation and len(attribute_translation) > 0:
                return attribute_translation
    return getattr(hub_supporter, attribute_name)
