export default function getLanguageNames(language, locale) {
  const allowed_lanuages = ["de", "en"];
  const languageNames = {
    de: {
      de: "Deutsch",
      en: "german",
    },
    en: {
      de: "Englisch",
      en: "english",
    },
  };
  if (!allowed_lanuages.includes(language) || !allowed_lanuages.includes(locale)) {
    return "";
  }
  return languageNames[language][locale];
}
