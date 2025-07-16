import { Dayjs } from "dayjs";

export type User = {
  id: string;
  first_name?: string;
  last_name?: string;
};

export type Role = {
  id: number;
  name: string;
  name_de_translation?: string;
  role_type: "all" | "read write" | "read only";
  explanation?: string;
  explanation_de_translation?: string;
};

export type SectorOptionType = {
  icon?: string;
  id: number;
  name: string;
  key: string;
  original_name?: string;
  thumbnail_image?: string;
};

export type SkillType = {
  id: number;
  key: number;
  name: string;
  original_name: string;
  parent_skill?: string;
  subcategories: SkillType[];
};

export type Project = {
  collaborators_welcome: boolean;
  status: string;
  skills: any[];
  helpful_connections: any[];
  collaborating_organizations: any[];
  loc: any;
  location?: any; //TODO: merge loc and location (loc used to post, location used when getting data from the backend currently)
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
  project_type: ProjectType | any;
  start_date?: Date | Dayjs | null;
  end_date?: Date | Dayjs | null;
  additional_loc_info?: string;
  short_description?: string;
  creator?: User | Organization | any; //TODO: remove 'any' once User and Organization types are properly defined
  image?: string;
  hubName?: string;
  sectors?: SectorOptionType[];
};

export type BrowseTab = "projects" | "organizations" | "members" | "events";
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
    contrast: PaletteColor;
  }
  interface PaletteOptions {
    yellow: PaletteColorOptions;
    contrast: PaletteColorOptions;
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

export type Supporter = {
  name: string;
  subtitle: string;
  logo: string;
  importance: number;
  organization_url_slug: string;
};
