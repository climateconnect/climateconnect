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
        raise ValidationError('Unsupported language: ' + language_code)
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
    if get_locale(translation['detected_source_language']) == target_locale:
        target_locale = original_locale
        original_locale = get_locale(translation['detected_source_language'])
        translation = translate(text, target_locale)  

    # If the detected source language is complete different from target_lang or original_lan: adapt original lang
    # Example: If person with german locale writes spanish text the text will be translated to english and source language will be spanish
    # (The example assumes that spanish is supported)
    if not get_locale(translation['detected_source_language']) == original_locale:
        original_locale = get_locale(translation['detected_source_language'])

    return {
        'original_text': text,
        'original_lang': original_locale,
        'translated_text': translation['text'],
        'translated_lang': target_locale
    }