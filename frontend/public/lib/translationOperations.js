import { arraysEqual } from "./generalOperations";

export function getTranslationsFromObject(translationsObject, type) {
  if (!Array.isArray(translationsObject)) return translationsObject;
  return translationsObject.reduce(function (obj, translation) {
    if (type === "user_profile") {
      obj[translation.language] = getUserProfileTranslationObject(translation);
    }
    if (type === "organization") {
      obj[translation.language] = getOrganizationTranslationObject(translation);
    }
    if (type === "project") {
      obj[translation.language] = getProjectTranslationObject(translation);
    }
    return obj;
  }, {});
}

export function getUserProfileTranslationObject(translation) {
  return {
    is_manual_translation: translation.is_manual_translation,
    bio: translation.biography_translation,
  };
}

export function getOrganizationTranslationObject(translation) {
  return {
    is_manual_translation: translation.is_manual_translation,
    short_description: translation.short_description_translation,
    name: translation.name_translation,
    school: translation.school_translation,
    organ: translation.organ_translation,
    about: translation.about_translation,
    get_involved: translation.get_involved_translation,
  };
}

export function getProjectTranslationObject(translation) {
  return {
    is_manual_translation: translation.is_manual_translation,
    short_description: translation.short_description_translation,
    name: translation.name_translation,
    description: translation.description_translation,
    helpful_connections: translation.helpful_connections_translation,
  };
}

export function getTranslationsWithoutRedundantKeys(oldTranslations, newTranslations) {
  const finalTranslationsObject = {};
  for (const language of Object.keys(newTranslations)) {
    for (const key of Object.keys(newTranslations[language])) {
      if (newTranslations[language][key] !== oldTranslations[language][key]) {
        if (!finalTranslationsObject[language]) {
          finalTranslationsObject[language] = { [key]: newTranslations[language][key] };
        } else {
          //For an array only return the elements that have changed
          if (Array.isArray(newTranslations[language][key])) {
            if (
              !oldTranslations[language] ||
              !oldTranslations[language][key] ||
              !arraysEqual(newTranslations[language][key], oldTranslations[language][key])
            ) {
              finalTranslationsObject[language][key] = newTranslations[language][key];
            }
          } else {
            finalTranslationsObject[language][key] = newTranslations[language][key];
          }
        }
      }
    }
  }
  return finalTranslationsObject;
}
