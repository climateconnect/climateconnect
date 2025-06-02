import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';

export type Link = {
  href: string;
  text: string;
  target?: string;
  iconForDrawer?: ComponentType<SvgIconProps>;
  showStaticLinksInDropdown?: boolean;
  hideOnStaticPages?: boolean;
  isExternalLink?: boolean;
  className?: string;
  hideOnMediumScreen?: boolean;
  type?: string;
};

export type HubConfig = {
  welcome: {
    en: any;
    de: any;
  } | string;
  hubTabLinkNarrowScreen?: Link;
  headerLink: Link[];
  headerStaticLink?: Link[];
};

export type CustomHubConfig = {
  prio1: HubConfig;
  scottish: HubConfig;
};
