import Cookies from "next-cookies";
import Router from "next/router";
import React, { useContext, useRef, useState } from "react";
import getOrganizationInfoMetadata from "../../public/data/organization_info_metadata.js";
import { apiRequest, getLocalePrefix, sendToLogin } from "../../public/lib/apiOperations";
import { indicateWrongLocation, isLocationValid } from "../../public/lib/locationOperations";
import getTexts from "../../public/texts/texts";
import EditAccountPage from "../../src/components/account/EditAccountPage";
import UserContext from "../../src/components/context/UserContext";
import PageNotFound from "../../src/components/general/PageNotFound";
import WideLayout from "../../src/components/layouts/WideLayout";
import { getOrganizationTagsOptions } from "./../../public/lib/getOptions";
import { blobFromObjectUrl, getImageUrl } from "./../../public/lib/imageOperations";

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
    organization: organization,
    tagOptions: tagOptions,
    token: token,
  };
}

//This route should only be accessible to admins of the organization
export default function EditOrganizationPage({ organization, tagOptions, token }) {
  const { locale } = useContext(UserContext);
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

  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";

  const saveChanges = async (editedOrg) => {
    const error = verifyChanges(editedOrg, texts).error;
    //verify location is valid and notify user if it's not
    if (
      editedOrg?.info?.location !== organization?.info?.location &&
      !isLocationValid(editedOrg?.info?.location) &&
      !legacyModeEnabled
    )
      indicateWrongLocation(
        locationInputRef,
        handleSetLocationOptionsOpen,
        handleSetErrorMessage,
        texts
      );
    if (error) {
      handleSetErrorMessage(error);
    } else {
      const org = await parseForRequest(getChanges(editedOrg, organization));
      apiRequest({
        method: "patch",
        url: "/api/organizations/" + encodeURI(organization.url_slug) + "/",
        payload: org,
        token: token,
        locale: locale
      })
      .then(function () {
        Router.push({
          pathname: "/organizations/" + organization.url_slug,
          query: {
            message: texts.successfully_edited_organization,
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error.response);
      });
    }
  };
  const handleCancel = () => {
    Router.push("/organizations/" + organization.url_slug);
  };
  const getChanges = (o, oldO) => {
    const finalProfile = {};
    const org = { ...o, ...o.info };
    delete org.info;
    const oldOrg = { ...oldO, ...oldO.info };
    delete oldOrg.info;
    Object.keys(org).map((k) => {
      if (oldOrg[k] && org[k] && Array.isArray(oldOrg[k]) && Array.isArray(org[k])) {
        if (!arraysEqual(oldOrg[k], org[k])) finalProfile[k] = org[k];
      } else if (oldOrg[k] !== org[k] && !(!oldOrg[k] && !org[k])) finalProfile[k] = org[k];
    });
    return finalProfile;
  };

  function arraysEqual(_arr1, _arr2) {
    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();
    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }

    return true;
  }

  return (
    <WideLayout title={organization ? organization.name : texts.not_found_error}>
      {organization ? (
        <EditAccountPage
          type="organization"
          account={organization}
          possibleAccountTypes={tagOptions}
          infoMetadata={infoMetadata}
          accountHref={getLocalePrefix(locale) + "/organizations/" + organization.url_slug}
          maxAccountTypes={2}
          handleSubmit={saveChanges}
          handleCancel={handleCancel}
          errorMessage={errorMessage}
        />
      ) : (
        <PageNotFound itemName={texts.organization} />
      )}
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
      locale: locale
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
    info: {
      location: organization.location,
      shortdescription: organization.short_description,
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

const parseForRequest = async (org) => {
  const parsedOrg = {
    ...org,
  };
  if (org.shortdescription) parsedOrg.short_description = org.shortdescription;
  if (org.parent_organization)
    parsedOrg.parent_organization = org.parent_organization ? org.parent_organization.id : null;
  if (org.background_image)
    parsedOrg.background_image = await blobFromObjectUrl(org.background_image);
  if (org.thumbnail_image) parsedOrg.thumbnail_image = await blobFromObjectUrl(org.thumbnail_image);
  if (org.image) parsedOrg.image = await blobFromObjectUrl(org.image);
  return parsedOrg;
};

const verifyChanges = (newOrg, texts) => {
  const requiredPropErrors = {
    image: texts.image_required_error,
    types: texts.type_required_errror,
    name: texts.name_required_error,
  };
  const requiredInfoPropErrors = {
    location: texts.location_required_error,
  };
  for (const prop of Object.keys(requiredPropErrors)) {
    if (!newOrg[prop] || (Array.isArray(newOrg[prop]) && newOrg[prop].length <= 0)) {
      return {
        error: requiredPropErrors[prop],
      };
    }
  }
  for (const prop of Object.keys(requiredInfoPropErrors)) {
    if (!newOrg.info[prop] || (Array.isArray(newOrg.info[prop]) && newOrg.info[prop].length <= 0)) {
      return {
        error: requiredInfoPropErrors[prop],
      };
    }
  }
  return true;
};
