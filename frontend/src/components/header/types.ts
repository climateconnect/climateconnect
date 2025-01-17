export interface HeaderProps {
  className?: string;
  noSpacingBottom?: boolean;
  isStaticPage?: boolean;
  fixedHeader?: boolean;
  transparentHeader?: boolean;
  background?: string;
  isHubPage?: boolean;
  hubUrl: string;
  isLocationHub?: boolean;
  getLinks: Function;
  getLoggedInLinks: Function;
}
