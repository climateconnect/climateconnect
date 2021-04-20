export function getTranslationsFromObject(translationsObject, type) {
  return translationsObject.reduce(function(obj, translation){
    if(type === "user_profile"){
      obj[translation.language] = getUserProfileTranslationObject(translation)
    }
    if(type === "organization"){
      obj[translation.language] = getOrganizationTranslationObject(translation)
    }
    return obj
  }, {})
}

export function getUserProfileTranslationObject(translation) {
  return {
    is_manual_translation: translation.is_manual_translation,
    bio: translation.biography_translation
  }
}

export function getOrganizationTranslationObject(translation) {
  return {
    is_manual_translation: translation.is_manual_translation,
    short_description: translation.short_description_translation,
    name: translation.name_translation,
    school: translation.school_translation,
    organ: translation.organ_translation
  }
}