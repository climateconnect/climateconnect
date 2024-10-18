import LocationOnIcon from "@mui/icons-material/LocationOn";
import { apiRequest } from "./apiOperations";
import { parseOptions } from "./selectOptionsOperations";

export type SkillsOption = {
  id: number;
  name: string;
  original_name: string;
  parent_skill: number | null;
};

export type StatusOption = {
  id: number;
  name: string;
  original_name: string;
  has_end_date: boolean;
  has_start_date: boolean;
  status_type: "idea" | "inprogress" | "finished" | "canceled" | "recurring" | "default";
};

export type ProjectTagsOption = {
  key: number;
  id: number; // TODO (Karol): redundancy ?
  name: string;
  original_name: string;
  subcategories?: ProjectTagsOption[];
};

export type ProjectTypesOption = {
  name: string;
  original_name: string;
  help_text: string;
  icon: any;
  type_id: "project" | "event" | "idea";
};

export type OrganizationTag = {
  id: number;
  key: number; // TODO (Karol): redundancy ?
  name: string;
  original_name: string;
  hide_get_involved: boolean;
  parent_tag: number; // id of the parent org.
  additionalInfo: string[];
  additional_info: string[] | null; // TODO (Karol): redundancy ?
};

export async function getSkillsOptions(
  locale,
  parentSkillsOnly?: boolean
): Promise<SkillsOption[] | null> {
  try {
    const resp = await apiRequest({
      method: "get",
      url: parentSkillsOnly ? "/parentskills/" : "/skills/",
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return parseOptions(
        resp.data.results.map((s) => ({ ...s, key: s.id })),
        "parent_skill"
      );
    }
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

export async function getStatusOptions(locale): Promise<StatusOption[] | null> {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projectstatus/",
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

export async function getProjectTagsOptions(hub, locale): Promise<ProjectTagsOption[] | null> {
  const url = hub ? `/api/projecttags/?hub=${hub}` : `/api/projecttags/`;
  try {
    const resp = await apiRequest({
      method: "get",
      url: url,
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return parseOptions(resp.data.results, "parent_tag");
    }
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

export async function getProjectTypeOptions(locale): Promise<ProjectTypesOption[] | null> {
  const url = `/api/project_type_options/`;
  try {
    const resp = await apiRequest({
      method: "get",
      url: url,
      locale: locale,
    });
    if (resp.data === null) return null;
    else {
      return resp.data;
    }
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

export async function getOrganizationTagsOptions(locale): Promise<OrganizationTag[] | null> {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizationtags/",
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results.map((t) => {
        // TODO (Karol): typo on additionalInfo instead of additional_info?
        return { ...t, key: t.id, additionalInfo: t.additional_info ? t.additional_info : [] };
      });
    }
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

//This function can not be called from getInitialProps, because the icon cannot be rendered as a component if this function is called on server side
export function membersWithAdditionalInfo(members) {
  return members.map((p) => {
    return {
      ...p,
      additionalInfo: [
        {
          text: p.location,
          icon: LocationOnIcon,
          iconName: "LocationOnIcon",
          importance: "high",
        },
      ],
    };
  });
}
