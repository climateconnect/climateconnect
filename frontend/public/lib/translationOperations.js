export function getTranslationsFromObject(translationsObject) {
  return translationsObject.reduce(function (obj, translation) {
    obj[translation.language] = getUserProfileTranslationObject(translation);
    return obj;
  }, {});
}

export function getUserProfileTranslationObject(translation) {
  return {
    is_manual_translation: translation.is_manual_translation,
    bio: translation.biography_translation,
  };
}
