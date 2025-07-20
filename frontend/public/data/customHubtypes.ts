import { ComponentType } from "react";
import { SvgIconProps } from "@mui/material";

export type Link = {
  href?: string;
  text?: string;
  target?: string;
  iconForDrawer?: ComponentType<SvgIconProps>;
  showStaticLinksInDropdown?: boolean;
  hideOnStaticPages?: boolean;
  isExternalLink?: boolean;
  className?: string;
  hideOnMediumScreen?: boolean;
  type?: string;
  only_show_in_languages?: any;
  only_show_on_static_page?: boolean;
};

export type HubConfig = {
  welcome:
    | {
        en: any;
        de: any;
      }
    | string;
  hubTabLinkNarrowScreen?: Link;
  headerLinks: Link[];
  headerStaticLinks?: Link[];
};

export type CustomHubConfig = {
  prio1: HubConfig;
  perth: HubConfig;
};
