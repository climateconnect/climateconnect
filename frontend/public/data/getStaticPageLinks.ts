//Lists all static page links. Expects navigation_texts
export function getStaticPageLinks(texts, locale, isStaticPage = false) {
  const links = [
    {
      href: "/about",
      text: texts.about,
    },
    {
      href: "/donate",
      text: texts.donate,
      only_show_on_static_page: true,
    },
    {
      href: "/team",
      text: texts.team,
      parent_item: "/about",
    },
    {
      href: "/verein",
      text: texts.association,
      parent_item: "/about",
      only_show_in_languages: ["de"],
    },
    {
      href: "/join",
      text: texts.join,
      parent_item: "/about",
    },
    {
      href: "/transparency",
      text: texts.transparency,
      parent_item: "/about",
    },
    // removed donorforest for now
    // as it is not up to date
    // {
    //   href: "/donorforest",
    //   text: texts.donorforest,
    //   parent_item: "/donate",
    // },
    {
      href: "/blog",
      text: texts.blog,
    },
    {
      href: "/press",
      text: texts.press,
    },
    {
      href: "/faq",
      text: texts.faq,
    },
  ];
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
