import getAboutTexts from "./about_texts"
import activate_email from "./activate_email.json"
import chat_texts from "./chat_texts.json"
import getCommunicationTexts from "./communication_texts"
import cookie_texts from "./cookie_texts.json"
import getDonateTexts from "./donate_texts"
import getFaqTexts from "./faq_texts"
import filter_and_search_texts from "./filter_and_search_texts.json"
import general_texts from "./general_texts.json"
import getHubTexts from "./getHubTexts"
import navigation_texts from "./navigation_texts.json"
import notification_texts from "./notification_texts.json"
import getOrganizationTexts from "./organization_texts"
import getProfileTexts from "./profile_texts"
import getProjectTexts from "./project_texts"
import settings_texts from "./settings.json"
import getTutorialTexts from "./tutorial_texts"

export default function getTexts({page, locale, hubName, organization, profile, project, classes}) {
  const texts = {
    about: getAboutTexts(classes),
    communication: getCommunicationTexts(),
    donate: getDonateTexts(),
    general: general_texts,
    activate_email: activate_email,
    settings: settings_texts,
    chat: chat_texts,
    organization: getOrganizationTexts({organization: organization}),
    faq: getFaqTexts(),
    filter_and_search: filter_and_search_texts,
    project: getProjectTexts({project: project}),
    cookie: cookie_texts,
    hub: getHubTexts({hubName: hubName}),
    navigation: navigation_texts,
    notification: notification_texts,
    profile: getProfileTexts({profile: profile}),
    tutorial: getTutorialTexts({hubName: hubName})
  }
  
  const text = {...texts[page], ...general_texts}
  const defaultLocale = "en"  
  
  return Object.keys(text).reduce((obj, curKey)=>{
    if(text[curKey][locale])
      obj[curKey] = text[curKey][locale]
    else
      obj[curKey] = text[curKey][defaultLocale]
    return obj
  }, {})
}
