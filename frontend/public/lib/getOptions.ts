import LocationOnIcon from "@mui/icons-material/LocationOn";
import { apiRequest } from "./apiOperations";
import { parseOptions } from "./selectOptionsOperations";

export async function getSkillsOptions(locale, parentSkillsOnly?: boolean) {
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

export async function getStatusOptions(locale) {
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

export async function getProjectTagsOptions(hub, locale) {
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

export async function getOrganizationTagsOptions(locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizationtags/",
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results.map((t) => {
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
