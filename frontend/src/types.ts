export type User = {
  id: string;
};

export type Project = {
  collaborators_welcome: boolean;
  status: string;
  skills: any[];
  helpful_connections: any[];
  collaborating_organizations: any[];
  loc: any;
  parent_organization: any;
  isPersonalProject: boolean;
  is_organization_project: boolean;
  team_members: any[];
  website: string;
  language: CcLocale;
  error?: boolean;
  is_draft?: boolean;
  url_slug?: string;
  name?: string;
  project_parents?: any[];
  tags?: any[];
};
export enum CcLocale {
  en = "en",
  de = "de",
}

declare module "@material-ui/core/styles/createPalette" {
  // augment theme type with climateconnect custom properties
  interface Palette {
    yellow: PaletteColor;
  }
  interface PaletteOptions {
    yellow: PaletteColorOptions;
  }
  interface PaletteColor {
    extraLight?: string;
    // lightHover?: string;
  }
  interface SimplePaletteColorOptions {
    lightHover?: string;
    extraLight?: string;
  }
}
