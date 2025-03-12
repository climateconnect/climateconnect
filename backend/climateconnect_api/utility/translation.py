import logging
from climateconnect_api.models.user import UserProfile, UserProfileTranslation
from django.db.models.query_utils import Q
from organization.models.translations import OrganizationTranslation, ProjectTranslation
from climateconnect_api.models.language import Language
import json

import requests
from django.conf import settings
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)


def get_locale(language_code):
    LANGUAGE_CODE_MAP = {
        "en-us": "en",
        "en-uk": "en",
        "en": "en",
        "EN": "en",
        "de": "de",
        "DE": "de",
    }
    if language_code not in LANGUAGE_CODE_MAP:
        logging.error("Unsupported language: " + language_code)
        return "en"
    return LANGUAGE_CODE_MAP[language_code]


def get_user_lang_code(user):
    try:
        user_profile = UserProfile.objects.get(user=user)
        return user_profile.language.language_code
    except UserProfile.DoesNotExist:
        # fall back to english
        return "en"


def get_user_lang_url(lang_code):
    if lang_code == "en":
        return ""
    else:
        return "/" + lang_code


def get_attribute_in_correct_language(obj, attr, language_code):
    lang_translation_attr = "{}_{}".format(attr, language_code)
    if hasattr(obj, lang_translation_attr):
        translation = getattr(obj, lang_translation_attr)
        if language_code != "en" and translation is not None:
            return translation
    return getattr(obj, attr)


def translate(text, target_lang):
    if text is None or len(text) == 0:
        return {"text": text}
    if not settings.DEEPL_API_KEY:
        logger.warning("DEEPL_API_KEY not set, not translating")
        return {"text": text}

    payload = {"text": text, "target_lang": target_lang}
    if target_lang == "de":
        payload["formality"] = "less"

    url = "https://api.deepl.com/v2/translate?auth_key=" + settings.DEEPL_API_KEY
    translation = requests.post(url, payload)
    return json.loads(translation.content)["translations"][0]


def translate_text(text, original_lang, target_lang):
    ALLOWED_LANGUAGE_CODES = ["en", "de"]
    original_locale = get_locale(original_lang)
    target_locale = get_locale(target_lang)
    if original_locale not in ALLOWED_LANGUAGE_CODES:
        raise ValidationError("Unsupported language: " + original_lang)
    if target_locale not in ALLOWED_LANGUAGE_CODES:
        raise ValidationError("Unsupported language: " + target_lang)
    if target_locale == original_locale:
        # If there is just 2 allowed languages, we can just assume that the target language is the other language besides the original language.
        if len(ALLOWED_LANGUAGE_CODES) == 2:
            for lc in ALLOWED_LANGUAGE_CODES:
                if not original_locale == lc:
                    target_locale = lc
        else:
            raise ValidationError(
                "target lang and original lang were identical:" + target_lang
            )
    if isinstance(text, list):
        translation_objects = []
        for element in text:
            translation_objects.append(translate(element, target_locale))
        print(translation_objects)
        translation = {
            "detected_source_language": original_lang,
            "text": list(
                map(
                    lambda translation_element: translation_element["text"],
                    translation_objects,
                )
            ),
        }
    else:
        translation = translate(text, target_locale)
        # If the source language is actually the target language (person with german locale wrote english text),
        # Switch source language and target language (change original lang from german to english and target lang from english to german)
        # Since this means we just translated a text from german to german, we need to call the translate function again and translate to english
        # (We only trust the detected source language if it's more than 150 characters)
        if "detected_source_language" in translation:
            if (
                len(text) > 150
                and get_locale(translation["detected_source_language"]) == target_locale
            ):
                target_locale = original_locale
                original_locale = get_locale(translation["detected_source_language"])
                translation = translate(text, target_locale)

            # If the detected source language is complete different from target_lang or original_lan: adapt original lang
            # Example: If person with german locale writes spanish text the text will be translated to english and source language will be spanish
            # (The example assumes that spanish is supported)
            # (We only trust the detected source language if it's more than 150 characters)
            if (
                len(text) > 150
                and not get_locale(translation["detected_source_language"])
                == original_locale
            ):
                original_locale = get_locale(translation["detected_source_language"])
    return {
        "original_text": text,
        "original_lang": original_locale,
        "translated_text": translation["text"],
        "translated_lang": target_locale,
    }


def get_translations(
    texts, translations, source_language, keys_to_ignore_for_translation=[], depth=0
):
    depth = int(depth)
    # if we started over the a different source language more than
    # one time that means the user used different languages in different texts.
    if depth > 1:
        raise ValueError
    finished_translations = {}
    for target_language in settings.LOCALES:
        if not target_language == source_language:
            finished_translations[target_language] = {"is_manual_translation": False}
            for key in texts.keys():
                # If the user manually translated and the translation
                # isn't an empty string: take the user's translation
                if (
                    target_language in translations
                    and "is_manual_translation" in translations[target_language]
                    and translations[target_language]["is_manual_translation"]
                    and key in translations[target_language]
                    and len(translations[target_language][key]) > 0
                ):
                    finished_translations[target_language][key] = translations[
                        target_language
                    ][key]
                    finished_translations["is_manual_translation"] = True
                # Else use DeepL to translate the text
                else:
                    # If the key should not be translated, just pass the original
                    # string (We do this for organization names for example)
                    if key in keys_to_ignore_for_translation:
                        translated_text_object = {
                            "original_lang": source_language,
                            "translated_text": texts[key],
                        }
                    else:
                        translated_text_object = translate_text(
                            texts[key], source_language, target_language
                        )
                    # If we got the source language wrong start over
                    # with the correct source language
                    if not translated_text_object["original_lang"] == source_language:
                        return get_translations(
                            texts,
                            translations,
                            translated_text_object["original_lang"],
                            keys_to_ignore_for_translation,
                            depth + 1,
                        )
                    finished_translations[target_language][
                        key
                    ] = translated_text_object["translated_text"]
    return {"translations": finished_translations, "source_language": source_language}


def edit_translations(items_to_translate, data, item, type):
    languages_to_translate_to = Language.objects.filter(~Q(id=item.language.id))
    for language in languages_to_translate_to:
        language_code = language.language_code
        if "translations" in data and language_code in data["translations"]:
            passed_lang_translation = data["translations"][language_code]
        else:
            passed_lang_translation = {}
        if type == "project":
            db_translations = ProjectTranslation.objects.filter(
                project=item, language=language
            )
        if type == "organization":
            db_translations = OrganizationTranslation.objects.filter(
                organization=item, language=language
            )
        if type == "user_profile":
            db_translations = UserProfileTranslation.objects.filter(
                user_profile=item, language=language
            )
        # If there already is a translation for this project: edit it
        if db_translations.exists():
            edit_translation(
                db_translations[0],
                passed_lang_translation,
                items_to_translate,
                data,
                item,
                language_code,
            )
        else:
            if "is_manual_translation" in passed_lang_translation:
                is_manual_translation = passed_lang_translation["is_manual_translation"]
            else:
                is_manual_translation = False
            if type == "project":
                db_translation = ProjectTranslation.objects.create(
                    is_manual_translation=is_manual_translation,
                    language=language,
                    project=item,
                )
            if type == "organization":
                db_translation = OrganizationTranslation.objects.create(
                    is_manual_translation=is_manual_translation,
                    language=language,
                    organization=item,
                )
            if type == "user_profile":
                db_translation = UserProfileTranslation.objects.create(
                    is_manual_translation=is_manual_translation,
                    language=language,
                    user_profile=item,
                )
            for translation_keys in items_to_translate:
                if (
                    is_manual_translation
                    and translation_keys["key"] in passed_lang_translation
                    and len(passed_lang_translation[translation_keys["key"]]) > 0
                ):
                    setattr(
                        db_translation,
                        translation_keys["translation_key"],
                        passed_lang_translation[translation_keys["key"]],
                    )
                else:
                    setattr(
                        db_translation,
                        translation_keys["translation_key"],
                        translate_text(
                            getattr(item, translation_keys["key"]),
                            item.language.language_code,
                            language_code,
                        )["translated_text"],
                    )

            db_translation.save()


def edit_translation(
    db_translation,
    passed_translation,
    items_to_translate,
    changed_properties,
    item,
    language_code,
):
    if "is_manual_translation" in passed_translation:
        db_translation.is_manual_translation = passed_translation[
            "is_manual_translation"
        ]
    for translation_keys in items_to_translate:
        if translation_keys["key"] in passed_translation:
            if (
                len(passed_translation[translation_keys["key"]]) == 0
                or db_translation.is_manual_translation is False
            ):
                if translation_keys["key"] in changed_properties:
                    setattr(
                        db_translation,
                        translation_keys["translation_key"],
                        translate_text(
                            getattr(item, translation_keys["key"]),
                            item.language.language_code,
                            language_code,
                        )["translated_text"],
                    )
            else:
                setattr(
                    db_translation,
                    translation_keys["translation_key"],
                    passed_translation[translation_keys["key"]],
                )
        elif (
            translation_keys["key"] in changed_properties
            and db_translation.is_manual_translation is False
        ):
            setattr(
                db_translation,
                translation_keys["translation_key"],
                translate_text(
                    getattr(item, translation_keys["key"]),
                    item.language.language_code,
                    language_code,
                )["translated_text"],
            )

    db_translation.save()
