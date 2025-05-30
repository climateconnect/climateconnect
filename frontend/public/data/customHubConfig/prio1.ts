import { Link } from '../customHubtypes';
import { COMMON_LINKS } from '../../lib/headerLink';
import InfoIcon from '@mui/icons-material/Info';
import { EnPrio1Welcome, DePrio1Willkommen } from '../../../devlink';
const PRIO1_BASE_URL = 'https://prio1-klima.net';

export const getPrio1Links = (pathToRedirect: string, texts: any): Link[] => [
  {
    href: PRIO1_BASE_URL,
    text: texts.PRIO1_klima,
    iconForDrawer: InfoIcon,
    showStaticLinksInDropdown: true,
    hideOnStaticPages: true,
    isExternalLink: true,
    className: 'btnIconTextColor',
  },
  {
    ...COMMON_LINKS.SHARE,
    href: '/share?hub=prio1',
    text: texts.share_a_project,
    hideOnMediumScreen: true,
  },
  {
    type: 'languageSelect',
  },
  {
    ...COMMON_LINKS.NOTIFICATIONS,
    text: texts.inbox,
  },
  ...COMMON_LINKS.AUTH_LINKS(pathToRedirect, texts, 'hub=prio1'),
];

export const prio1StaticLinks = (texts: any): Link[] => [
   {
    href: `${PRIO1_BASE_URL}/klima-preis/`,
    text: texts.PRIO1_Climate_Prize,
    target: "_blank",
    isExternalLink: true,
  },
  {
    href: `${PRIO1_BASE_URL}/prio1-community/`,
    text: texts.PRIO1_community,
    target: "_blank",
    isExternalLink: true,
  },
  {
    href: `${PRIO1_BASE_URL}/akteure/`,
    text: texts.for_actors,
    target: "_blank",
    isExternalLink: true,
  },
];

export const prio1Config = (pathToRedirect: string, texts: any) => ({
  welcome: {
    en: EnPrio1Welcome,
    de: DePrio1Willkommen,
  },
  hubTabLinkNarrowScreen: {
    href: PRIO1_BASE_URL,
    text: texts.PRIO1_klima,
  },
  headerLink: getPrio1Links(pathToRedirect, texts),
  headerStaticLink: prio1StaticLinks(texts),
});
