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
 * The value is constructed dynamically so that adding a new language to the
 * platform requires no code change here — only adding LocationTranslation rows
 * in the database is sufficient.
 *
 * @example
 *   const headers = getLocaleHeader("de");
 *   // { "Accept-Language": "de;q=1.0,en-US;q=0.8,en;q=0.7" }
 */
export function getLocaleHeader(locale: string | undefined): Record<string, string> {
  const primary = (locale ?? "en").split("-")[0].toLowerCase();
  // Build a standard quality-factor list with English as the canonical fallback.
  const value =
    primary === "en"
      ? "en-US,en;q=0.9"
      : `${primary};q=1.0,en-US;q=0.8,en;q=0.7`;
  return { "Accept-Language": value };
}
