from django.conf import settings
import requests
from rest_framework.exceptions import ValidationError
import json

def get_locale(language_code):
    LANGUAGE_CODE_MAP = {
        "en-us": "en",
        "en-uk": "en",
        "en": "en",
        "EN": "en",
        "de": "de",
        "DE": "de"
    }
    if(language_code not in LANGUAGE_CODE_MAP):
       print('Unsupported language: ' + language_code)
       return "en"
    return LANGUAGE_CODE_MAP[language_code]


def translate(text, target_lang):
    payload = {
        'text': text,
        'target_lang': target_lang
    }
    url = "https://api.deepl.com/v2/translate?auth_key=" + settings.DEEPL_API_KEY
    translation = requests.post(url, payload)
    return json.loads(translation.text)['translations'][0]


def translate_text(text, original_lang, target_lang):
    ALLOWED_LANGUAGE_CODES = ["en", "de"]
    original_locale = get_locale(original_lang)
    target_locale = get_locale(target_lang)
    if(original_locale not in ALLOWED_LANGUAGE_CODES):
        raise ValidationError('Unsupported language: ' + original_lang)
    if(target_locale not in ALLOWED_LANGUAGE_CODES):
        raise ValidationError('Unsupported language: ' + target_lang)
    if target_locale == original_locale:
        # If there is just 2 allowed languages, we can just assume that the target language is the other language besides the original language.
        if len(ALLOWED_LANGUAGE_CODES) == 2:
            for lc in ALLOWED_LANGUAGE_CODES:
                if not original_locale == lc:
                    target_locale = lc
        else:
            raise ValidationError('target lang and original lang were identical:' + target_lang)

    translation = translate(text, target_locale)
    # If the source language is actually the target language (person with german locale wrote english text), 
    # Switch source language and target language (change original lang from german to english and target lang from english to german)
    # Since this means we just translated a text from german to german, we need to call the translate function again and translate to english
    # (We only trust the detected source language if it's more than 150 characters)
    if len(text) > 150 and get_locale(translation['detected_source_language']) == target_locale:
        target_locale = original_locale
        original_locale = get_locale(translation['detected_source_language'])
        translation = translate(text, target_locale)  

    # If the detected source language is complete different from target_lang or original_lan: adapt original lang
    # Example: If person with german locale writes spanish text the text will be translated to english and source language will be spanish
    # (The example assumes that spanish is supported)
    # (We only trust the detected source language if it's more than 150 characters)
    if len(text) > 150 and not get_locale(translation['detected_source_language']) == original_locale:
        original_locale = get_locale(translation['detected_source_language'])

    return {
        'original_text': text,
        'original_lang': original_locale,
        'translated_text': translation['text'],
        'translated_lang': target_locale
    }

def get_translations(texts, translations, source_language, depth=0):
    depth = int(depth)
    # if we started over the a different source language more than one time that means the user used different languages in different texts.
    if depth > 1:
        raise ValueError
    finished_translations = {}
    for target_language in settings.LOCALES:
        if not target_language == source_language:
            finished_translations[target_language] = {
                'is_manual_translation': False
            }
            for key in texts.keys():
                # If the user manually translated and the translation isn't an empty string: take the user's translation
                if (
                    'is_manual_translation' in translations[target_language] and \
                        translations[target_language]['is_manual_translation'] and \
                        key in translations[target_language] and \
                        len(translations[target_language][key]) > 0
                ):
                    finished_translations[target_language][key] = translations[target_language][key]
                    finished_translations['is_manual_translation']= True
                # Else use DeepL to translate the text
                else:
                    translated_text_object = translate_text(texts[key], source_language, target_language)
                    # If we got the source language wrong start over with the correct source language
                    if not translated_text_object['original_lang'] == source_language:
                        return get_translations(texts, translations, translated_text_object.original_lang, depth + 1)
                    finished_translations[target_language][key] = translated_text_object['translated_text']
    return {
        'translations': finished_translations,
        'source_language': source_language
    }