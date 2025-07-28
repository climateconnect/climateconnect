//Lists all static page links. Expects navigation_texts
import { getStaticLinks } from "../lib/headerLinks";
import { Link } from "./customHubtypes";

export function getStaticPageLinks(texts, locale, customHubUrlSlug, isStaticPage = false) {
  const links: Link[] = getStaticLinks(texts, customHubUrlSlug) || [];

  if (locale) {
    return links.filter((l) => {
      if (
        (!l.only_show_in_languages || l.only_show_in_languages.includes(locale)) &&
        (!l.only_show_on_static_page || isStaticPage)
      ) {
        return true;
      } else {
        return false;
      }
    });
  } else {
    return links;
  }
}
