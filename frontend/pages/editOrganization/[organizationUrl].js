import Cookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";
import getOrganizationInfoMetadata from "../../public/data/organization_info_metadata.js";
import { apiRequest, sendToLogin } from "../../public/lib/apiOperations";
import { nullifyUndefinedValues } from "../../public/lib/profileOperations.js";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import WideLayout from "../../src/components/layouts/WideLayout";
import EditOrganizationRoot from "../../src/components/organization/EditOrganizationRoot.js";
import { getOrganizationTagsOptions } from "./../../public/lib/getOptions";
import { getImageUrl } from "./../../public/lib/imageOperations";

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  if (ctx.req && !token) {
    const texts = getTexts({ page: "organization", locale: ctx.locale });
    const message = texts.log_in_to_edit_organization;
    return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  }
  const url = encodeURI(ctx.query.organizationUrl);
  const [organization, tagOptions] = await Promise.all([
    getOrganizationByUrlIfExists(url, token, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
  ]);
  return {
    props: nullifyUndefinedValues({
      organization: organization,
      tagOptions: tagOptions,
    }),
  };
}

//This route should only be accessible to admins of the organization
export default function EditOrganizationPage({ organization, tagOptions }) {
  const { locale } = useContext(UserContext);
  console.log(organization);
  const texts = getTexts({ page: "organization", locale: locale });
  const organization_info_metadata = getOrganizationInfoMetadata(locale);
  const [errorMessage, setErrorMessage] = useState("");
  const locationInputRef = useRef(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);

  const handleSetLocationOptionsOpen = (newValue) => {
    setLocationOptionsOpen(newValue);
  };

  const infoMetadata = {
    ...organization_info_metadata,
    location: {
      ...organization_info_metadata.location,
      locationOptionsOpen: locationOptionsOpen,
      setLocationOptionsOpen: handleSetLocationOptionsOpen,
      locationInputRef: locationInputRef,
    },
  };

  const handleSetErrorMessage = (msg) => {
    setErrorMessage(msg);
    window.scrollTo(0, 0);
  };

  return (
    <WideLayout title={organization ? organization.name : texts.not_found_error}>
      <EditOrganizationRoot
        organization={organization}
        tagOptions={tagOptions}
        infoMetadata={infoMetadata}
        handleSetErrorMessage={handleSetErrorMessage}
        locationInputRef={locationInputRef}
        handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
        errorMessage={errorMessage}
        initialTranslations={organization.translations}
      />
    </WideLayout>
  );
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getOrganizationByUrlIfExists(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/?edit_view=true",
      token: token,
      locale: locale,
    });
    return parseOrganization(resp.data);
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseOrganization(organization) {
  const org = {
    url_slug: organization.url_slug,
    background_image: getImageUrl(organization.background_image),
    name: organization.name,
    image: getImageUrl(organization.image),
    types: organization.types.map((t) => ({ ...t.organization_tag, key: t.organization_tag.id })),
    language: organization.language,
    translations: organization.translations,
    info: {
      location: organization.location,
      short_description: organization.short_description,
      website: organization.website,
    },
  };
  org.types = org.types.map((t) => t.key);
  const additional_info = organization.types.reduce((additionalInfoArray, t) => {
    const type = t.organization_tag;
    if (type.additional_info && type.additional_info.length > 0) {
      additionalInfoArray = additionalInfoArray.concat(type.additional_info);
    } else console.log(type.additional_info);
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
