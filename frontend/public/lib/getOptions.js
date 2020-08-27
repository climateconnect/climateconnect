import axios from "axios";
import { parseOptions } from "./selectOptionsOperations";

export async function getSkillsOptions() {
  try {
    const resp = await axios.get(process.env.API_URL + "/skills/");
    if (resp.data.results.length === 0) return null;
    else {
      return parseOptions(
        resp.data.results.map(s => ({ ...s, key: s.id })),
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

export async function getProjectTagsOptions() {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/projecttags/");
    if (resp.data.results.length === 0) return null;
    else {
      return parseOptions(resp.data.results, "parent_tag");
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
      return resp.data.results.map(t => {
        return { ...t, key: t.id, additionalInfo: t.additional_info ? t.additional_info : [] };
      });
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}
