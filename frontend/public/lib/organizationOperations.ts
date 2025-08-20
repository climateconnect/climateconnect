import { apiRequest } from "./apiOperations";
import { getImageUrl } from "./imageOperations";

export function parseOrganization(organization, editMode: boolean = false) {
  const org = {
    url_slug: organization.url_slug,
    background_image: getImageUrl(organization.background_image),
    name: organization.name,
    image: getImageUrl(organization.image),
    types: organization.types.map((t) => ({ ...t.organization_tag, key: t.organization_tag.id })),
    language: organization.language,
    translations: organization.translations,
    sectors: organization.sectors,
    number_of_followers: organization.number_of_followers,
    info: getOrganizationInfo(organization, editMode) as any,
  };

  if (editMode)
    org.types = org.types.map((t) => ({ key: t.key, hide_get_involved: t.hide_get_involved }));
  const additional_info = organization.types.reduce((additionalInfoArray, t) => {
    const type = t.organization_tag;
    if (type.additional_info && type.additional_info.length > 0) {
      additionalInfoArray = additionalInfoArray.concat(type.additional_info);
    }
    return additionalInfoArray;
  }, []);
  additional_info.map((infoEl) => {
    org.info[infoEl] = organization[infoEl];
  });
  //Add parent org late so it's the lowest entry on the page
  const hasParentOrganization =
    organization.parent_organization && !!organization.parent_organization.name;
  if (hasParentOrganization) org.info.parent_organization = organization.parent_organization;
  else org.info.parent_organization = null;
  org.info.has_parent_organization = hasParentOrganization;
  return org;
}

export async function getUserOrganizations(token, locale) {
  //short circuit if the user is not logged in
  if (!token) return null;
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/my_organizations/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return resp.data.map((o) => o.organization);
    }
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function getOrganizationInfo(organization, editMode) {
  const info = {
    location: organization.location,
    short_description: organization.short_description,
    website: organization.website,
    about: organization.about,
  };

  const sectors = {
    sectors: organization.sectors.sort((a, b) => a.order - b.order).map((s) => s.sector),
  };

  const orgSizeAndInvolvement = {
    organization_size: organization.organization_size,
    get_involved: organization.get_involved,
  };
  /* For organization sizes and involvement we must differ between editing and non editing attribute for this object. 
         When editing, it is required to have the attributes separate in order to use the generic functions to modify the fields in EditAccountPage.js
         When displaying the Org page outside of editing we want to have the info be contained inside the same attribute to display them side by side.
 */
  if (editMode) {
    return {
      ...info,
      ...orgSizeAndInvolvement,
      ...sectors,
    };
  } else {
    return {
      ...info,
      organization_size_and_involvement: {
        ...orgSizeAndInvolvement,
      },
      ...sectors,
    };
  }
}
