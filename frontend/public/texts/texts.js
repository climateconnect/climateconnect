import getAboutTexts from "./about_texts";
import account_texts from "./account_texts.json";
import activate_email from "./activate_email.json";
import chat_texts from "./chat_texts.json";
import getCommunicationTexts from "./communication_texts";
import cookie_texts from "./cookie_texts.json";
import getDashboardTexts from "./dashboard_texts";
import getDonateTexts from "./donate_texts";
import getFaqTexts from "./faq_texts";
import filter_and_search_texts from "./filter_and_search_texts.json";
import general_texts from "./general_texts.json";
import getHubTexts from "./getHubTexts";
import getIdeaTexts from "./idea_texts";
import getLandingPageTexts from "./landing_page_texts";
import navigation_texts from "./navigation_texts.json";
import getNotificationTexts from "./notification_texts";
import getOrganizationTexts from "./organization_texts";
import getProfileTexts from "./profile_texts";
import getProjectTexts from "./project_texts";
import settings_texts from "./settings.json";
import getTutorialTexts from "./tutorial_texts";

export default function getTexts({
  page,
  locale,
  hubName,
  organization,
  profile,
  project,
  classes,
  isNarrowScreen,
  url_slug,
  user,
  goal,
  idea,
}) {
  // These are the multiple text files for various translations. They're
  // split up to reduce the amount of work required to download
  const texts = {
    about: getAboutTexts(classes),
    account: account_texts,
    activate_email: activate_email,
    chat: chat_texts,
    cookie: cookie_texts,
    communication: getCommunicationTexts(),
    dashboard: getDashboardTexts({ user: user }),
    donate: getDonateTexts({ classes: classes, goal: goal }),
    faq: getFaqTexts({ classes: classes, locale: locale }),
    filter_and_search: filter_and_search_texts,
    general: general_texts,
    hub: getHubTexts({ hubName: hubName }),
    idea: getIdeaTexts({ idea: idea, user: user, url_slug: url_slug, locale: locale }),
    landing_page: getLandingPageTexts({ classes: classes, isNarrowScreen: isNarrowScreen }),
    navigation: navigation_texts,
    notification: getNotificationTexts({ idea: idea }),
    organization: getOrganizationTexts({ organization: organization, locale: locale }),
    profile: getProfileTexts({ profile: profile, locale: locale }),
    project: getProjectTexts({ project: project, user: user, url_slug: url_slug, locale: locale }),
    settings: settings_texts,
    tutorial: getTutorialTexts({ hubName: hubName, classes: classes, locale: locale }),
  };

  const text = { ...texts[page], ...general_texts };
  const defaultLocale = "en";

  return Object.keys(text).reduce((obj, curKey) => {
    if (text[curKey][locale]) obj[curKey] = text[curKey][locale];
    else obj[curKey] = text[curKey][defaultLocale];
    return obj;
  }, {});
}
