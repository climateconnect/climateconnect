import { Dayjs } from "dayjs";

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
  type: ProjectType;
  start_date?: Date | Dayjs | null;
  end_date?: Date | Dayjs | null;
  additional_loc_info?: string;
};

export type ProjectType = "project" | "idea" | "event";

export type Organization = {
  location: any;
  name: string;
  thumbnail_image: string;
  url_slug: string;
};

export type CcLocale = "en" | "de";

declare module "@mui/material/styles/createPalette" {
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
