import NextCookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";
import getOrganizationInfoMetadata from "../../public/data/organization_info_metadata";
import { apiRequest, sendToLogin } from "../../public/lib/apiOperations";
import { getAllHubs } from "../../public/lib/hubOperations";
import { parseOrganization } from "../../public/lib/organizationOperations";
import { nullifyUndefinedValues } from "../../public/lib/profileOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import WideLayout from "../../src/components/layouts/WideLayout";
import EditOrganizationRoot from "../../src/components/organization/EditOrganizationRoot";
import { getOrganizationTagsOptions } from "./../../public/lib/getOptions";

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  if (ctx.req && !auth_token) {
    const texts = getTexts({ page: "organization", locale: ctx.locale });
    const message = texts.log_in_to_edit_organization;
    return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  }
  const url = encodeURI(ctx.query.organizationUrl);
  const [organization, tagOptions, allHubs] = await Promise.all([
    getOrganizationByUrlIfExists(url, auth_token, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getAllHubs(ctx.locale, true),
  ]);
  return {
    props: nullifyUndefinedValues({
      organization: organization,
      tagOptions: tagOptions,
      allHubs: allHubs,
    }),
  };
}

//This route should only be accessible to admins of the organization
export default function EditOrganizationPage({ organization, tagOptions, allHubs }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale });
  const organization_info_metadata = getOrganizationInfoMetadata(locale, organization, true);
  const [errorMessage, setErrorMessage] = useState("");
  const [existingUrlSlug, setExistingUrlSlug] = useState("");
  const [existingName, setExistingName] = useState("");
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

  const handleSetExistingUrlSlug = (urlSlug) => {
    setExistingUrlSlug(urlSlug);
  };

  const handleSetExistingName = (name) => {
    setExistingName(name);
  };

  return (
    <WideLayout title={organization ? organization.name : texts.not_found_error}>
      <EditOrganizationRoot
        allHubs={allHubs}
        errorMessage={errorMessage}
        existingUrlSlug={existingUrlSlug}
        existingName={existingName}
        handleSetErrorMessage={handleSetErrorMessage}
        handleSetExistingName={handleSetExistingName}
        handleSetExistingUrlSlug={handleSetExistingUrlSlug}
        handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
        infoMetadata={infoMetadata}
        initialTranslations={organization.translations}
        locationInputRef={locationInputRef}
        organization={organization}
        tagOptions={tagOptions}
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
    return parseOrganization(resp.data, true);
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}
