import { getImageUrl } from "./imageOperations";

export function parseOrganization(organization, reduceTypes) {
  const org = {
    url_slug: organization.url_slug,
    background_image: getImageUrl(organization.background_image),
    name: organization.name,
    image: getImageUrl(organization.image),
    types: organization.types
      ? organization.types.map(t => ({ ...t.organization_tag, key: t.organization_tag.id }))
      : [],
    info: {
      location: organization.city
        ? organization.city + ", " + organization.country
        : organization.country,
      shortdescription: organization.short_description,
      website: organization.website
    }
  };
  if (reduceTypes) org.types = organization.types ? org.types.map(t => t.key) : [];
  const additional_info = organization.types.reduce((additionalInfoArray, t) => {
    const type = t.organization_tag;
    if (type.additional_info && type.additional_info.length > 0) {
      additionalInfoArray = additionalInfoArray.concat(type.additional_info);
    } else return additionalInfoArray;
  }, []);
  if (additional_info) {
    additional_info.map(infoEl => {
      org.info[infoEl] = organization[infoEl];
    });
  } else {
    console.log(organization.types);
    console.log(additional_info);
  }
  //Add parent org late so it's the lowest entry on the page
  org.info.parent_organization = organization.parent_organization;
  return org;
}
