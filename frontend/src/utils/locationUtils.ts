/**
 * Utility helpers for locale-aware location API requests.
 *
 * The Accept-Language header is the mechanism used to communicate the current
 * user locale to the backend so that translated location names are returned
 * where available (see LocationTranslation model).
 */

/**
 * Returns an HTTP headers object containing the correct Accept-Language value
 * for the given locale string.
 *
 * @example
 *   const headers = getLocaleHeader("de");
 *   // { "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7" }
 */
export function getLocaleHeader(locale: string | undefined): Record<string, string> {
  const acceptLanguageByLocale: Record<string, string> = {
    de: "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    en: "en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7",
  };

  const primaryTag = (locale ?? "en").split("-")[0].toLowerCase();
  const value = acceptLanguageByLocale[primaryTag] ?? acceptLanguageByLocale["en"];
  return { "Accept-Language": value };
}
