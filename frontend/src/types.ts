import { Dayjs } from "dayjs";
import {
  OrganizationTag,
  ProjectTagsOption,
  SkillsOption,
  StatusOption,
} from "../public/lib/getOptions";

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
};

export type ProjectType = "project" | "idea" | "event";
export type BrowseTabs = "projects" | "members" | "ideas" | "events" | "organizations";

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

// Types for the filter options

export type FilterChoices = {
  project_categories: ProjectTagsOption[] | null;
  organization_types: OrganizationTag[] | null;
  skills: SkillsOption[] | null;
  project_statuses: StatusOption[] | null;
};
