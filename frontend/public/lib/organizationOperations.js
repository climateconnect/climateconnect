import { apiRequest } from "./apiOperations";
import { getImageUrl } from "./imageOperations";

export function parseOrganization(organization, editMode) {
  const org = {
    url_slug: organization.url_slug,
    background_image: getImageUrl(organization.background_image),
    name: organization.name,
    image: getImageUrl(organization.image),
    types: organization.types.map((t) => ({ ...t.organization_tag, key: t.organization_tag.id })),
    language: organization.language,
    translations: organization.translations,
    hubs: organization.hubs,
    info: {
      location: organization.location,
      short_description: organization.short_description,
      website: organization.website,
      about: organization.about,
      organization_size: organization.organization_size,
      social_options: assignKeys(organization.social_medias),
      hubs: organization.hubs,
    },
  };

  if (editMode) org.types = org.types.map((t) => t.key);

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
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

// goal is to add keys to each different type of social media (in this case its only 5)
function assignKeys(socials) {
  const keyedSocials = [];

  // matches http://, https:// , https://www. ,http://www.
  const regexPrefix = "^(http)(?:s)?(://)(?:www.)?";

  // matches.com/ anything
  const regexSuffix = ".com/.+$";

  const twitterRegex = new RegExp(regexPrefix + "twitter" + regexSuffix);
  const youtubeRegex = new RegExp(regexPrefix + "youtube" + regexSuffix);
  const linkedInRegex = new RegExp(regexPrefix + "linkedin" + regexSuffix);
  const instagramRegex = new RegExp(regexPrefix + "instagram" + regexSuffix);
  const facebookRegex = new RegExp(regexPrefix + "facebook" + regexSuffix);

  socials.map((sm) => {
    // check for twitter
    const socialMediaChannel = {
      ...sm.social_media_channel,
      is_checked: true,
    };
    if (twitterRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 0,
      });
    }
    // check for youtube
    if (youtubeRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 1,
      });
    }
    // check for linkedIn
    if (linkedInRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 2,
      });
    }
    // check for instagram
    if (instagramRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 3,
      });
    }
    // check for facebook
    if (facebookRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 4,
      });
    }
  });
  return keyedSocials;
}
