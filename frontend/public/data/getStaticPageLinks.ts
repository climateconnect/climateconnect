//Lists all static page links. Expects navigation_texts
import { getStaticLinks } from "../../public/lib/headerLink";
export function getStaticPageLinks(texts, locale, isCustomHub, isStaticPage = false) {
  const links = getStaticLinks(texts, isCustomHub);
  if (locale) {
    return links.filter((l) => {
      if (
        (!l.only_show_in_languages || l.only_show_in_languages.includes(locale)) &&
        (!l.only_show_on_static_page || isStaticPage)
      ) {
        return l;
      }
    });
  } else {
    return links;
  }
}
