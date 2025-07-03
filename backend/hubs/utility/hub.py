from hubs.models import Hub, HubStat, HubSupporter
from django.db.models import Case, When, IntegerField


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


def get_hub_supporter_attribute(
    hub_supporter: HubSupporter, attribute_name, language_code: str
) -> str:
    if (
        hub_supporter.language is not None
        and language_code != hub_supporter.language.language_code
        and hub_supporter.translate_hub_supporter.filter(
            language__language_code=language_code
        ).exists()
    ):
        translation = hub_supporter.translate_hub_supporter.get(
            # first hub_supporter is the field name in the HubSupporterTranslation model
            language__language_code=language_code,
            hub_supporter=hub_supporter,
        )
        attribute_translation = getattr(translation, attribute_name + "_translation")
        if attribute_translation and len(attribute_translation) > 0:
            return attribute_translation
    return getattr(hub_supporter, attribute_name)


def get_parents_hubs(hub):
    hubs = [hub]
    while hub.parent_hub:
        hub = hub.parent_hub
        hubs.append(hub)
    return hubs


def get_parents_hubs_and_annotations(hub):
    hubs = get_parents_hubs(hub)
    whens = [When(hub=h, then=i + 1) for i, h in enumerate(hubs)]

    annotations = Case(
        *whens,
        default=-1,
        output_field=IntegerField(),
    )
    return hubs, annotations
