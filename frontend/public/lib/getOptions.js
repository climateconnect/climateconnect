import axios from "axios";
import { parseOptions } from "./selectOptionsOperations";
import LocationOnIcon from "@material-ui/icons/LocationOn";

export async function getSkillsOptions() {
  try {
    const resp = await axios.get(process.env.API_URL + "/skills/");
    if (resp.data.results.length === 0) return null;
    else {
      return parseOptions(
        resp.data.results.map((s) => ({ ...s, key: s.id })),
        "parent_skill"
      );
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

export async function getStatusOptions() {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/projectstatus/");
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

export async function getProjectTagsOptions(parent_tag_key) {
  const url = parent_tag_key
    ? `${process.env.API_URL}/api/projecttags/?parent_tag_key=${parent_tag_key}`
    : `${process.env.API_URL}/api/projecttags/`;
  try {
    const resp = await axios.get(url);
    if (resp.data.results.length === 0) return null;
    else {
      if (parent_tag_key) return resp.data.results;
      else return parseOptions(resp.data.results, "parent_tag");
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

export async function getOrganizationTagsOptions() {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/organizationtags/");
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results.map((t) => {
        return { ...t, key: t.id, additionalInfo: t.additional_info ? t.additional_info : [] };
      });
    }
  } catch (err) {
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
