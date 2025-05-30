import { Link } from './types';
import { getScottLinks } from '../lib/headerLink';
import { prio1StaticLinks } from './prio1Config';

export const scottConfig = (pathToRedirect: string, texts: any) => ({
  welcome: 'DEVLINK_ELEMENT',
  headerLink: getScottLinks(pathToRedirect, texts),
  headerStaticLink: prio1StaticLinks(texts), // TODO: Replace with Scott-specific links when available
});
