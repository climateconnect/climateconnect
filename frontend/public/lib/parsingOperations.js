export function parseData({ type, data }) {
  if (type === "projects") return parseProjects(data);
  if (type === "organizations") return parseOrganizations(data);
  if (type === "members") return parseMembers(data);
}

const parseProjects = (projects) => {
  return projects.map((project) => ({
    ...project,
    location: project.city ? project.city + ", " + project.country : project.country,
  }));
};

const parseMembers = (members) => {
  return members.map((member) => ({
    ...member,
    location: members.city ? member.city + ", " + member.country : member.country,
  }));
};

const parseOrganizations = (organizations) => {
  return organizations.map((organization) => ({
    ...organization,
    types: organization.types.map((type) => type.organization_tag),
    info: {
      location: organization.city
        ? organization.city + ", " + organization.country
        : organization.country,
    },
  }));
};
