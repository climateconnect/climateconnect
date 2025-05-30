import { Link } from '../customHubtypes';
import { COMMON_LINKS } from '../../lib/headerLink';
import InfoIcon from '@mui/icons-material/Info';

const SCOTT_BASE_URL = 'https://climateconnect.scot';
const NETWORKS_URL = `${SCOTT_BASE_URL}/networks-across-perth-kinross`;

export const getScottLinks = (pathToRedirect: string, texts: any): Link[] => [
  {
    href: 'https://prio1-klima.net',
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

export const scottishStaticLinks = (texts: any): Link[] => [
  {
    href: `${NETWORKS_URL}/nature-network/`,
    text: texts.PRIO1_Climate_Prize,
    target: '_blank',
    isExternalLink: true,
  },
  {
    href: `${NETWORKS_URL}/climate-cafe-network/`,
    text: texts.PRIO1_community,
    target: '_blank',
    isExternalLink: true,
  },
  {
    href: `${NETWORKS_URL}/zero-waste-network/`,
    text: texts.for_actors,
    target: '_blank',
    isExternalLink: true,
  },
];

export const scottConfig = (pathToRedirect: string, texts: any) => ({
  welcome: 'DEVLINK_ELEMENT',
  hubTabLinkNarrowScreen: {
    href: SCOTT_BASE_URL,
    text: texts.PRIO1_klima,
  },
  headerLink: getScottLinks(pathToRedirect, texts),
  headerStaticLink: scottishStaticLinks(texts),
});
