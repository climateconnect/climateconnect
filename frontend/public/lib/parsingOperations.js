import getProjectInfoMetadata from "../data/getProjectInfoMetadata";
import getOrganizationInfoMetadata from "../data/organization_info_metadata";
import profile_info_metadata from "../data/profile_info_metadata";

export function parseData({ type, data }) {
  if (type === "projects") return parseProjects(data);
  if (type === "organizations") return parseOrganizations(data);
  if (type === "members") return parseMembers(data);
}

const parseProjects = (projects) => {
  return projects.map((project) => ({
    ...project,
    location: project.location,
  }));
};

const parseMembers = (members) => {
  return members;
};

const parseOrganizations = (organizations) => {
  return organizations.map((organization) => ({
    ...organization,
    types: organization.types.map((type) => type.organization_tag),
    info: {
      location: organization.location,
    },
  }));
};

export function getMessageFromUrl(message) {
  if (typeof message === "object") return message;
  else return decodeURIComponent(message).replaceAll("+", " ");
}

export function getInfoMetadataByType(type, locale) {
  if (type === "organizations") return getOrganizationInfoMetadata(locale);
  if (type === "profiles") return profile_info_metadata(locale);
  if (type === "projects") return getProjectInfoMetadata();
}
