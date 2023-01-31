//Lists all static page links. Expects navigation_texts
export function getStaticPageLinks(texts) {
  return [
    {
      href: "/about",
      text: texts.about,
    },
    {
      href: "/donate",
      text: texts.donate,
    },
    {
      href: "/team",
      text: texts.team,
      parent_item: "/about",
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
    {
      href: "/donorforest",
      text: texts.donorforest,
      parent_item: "/donate",
    },
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
}
