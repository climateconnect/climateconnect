import Cookies from "next-cookies";
import Router from "next/router";
import React, { useContext, useRef } from "react";
import { apiRequest, getLocalePrefix } from "../public/lib/apiOperations";
import { blobFromObjectUrl } from "../public/lib/imageOperations";
import {
  getLocationValue,
  indicateWrongLocation,
  isLocationValid,
  parseLocation,
} from "../public/lib/locationOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import Layout from "./../src/components/layouts/layout";
import WideLayout from "./../src/components/layouts/WideLayout";
import EnterBasicOrganizationInfo from "./../src/components/organization/EnterBasicOrganizationInfo";
import EnterDetailledOrganizationInfo from "./../src/components/organization/EnterDetailledOrganizationInfo";

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  const [tagOptions, rolesOptions] = await Promise.all([
    await getTags(token, ctx.locale),
    await getRolesOptions(token, ctx.locale),
  ]);
  return {
    props: {
      tagOptions: tagOptions,
      token: token,
      rolesOptions: rolesOptions,
    },
  };
}

export default function CreateOrganization({ tagOptions, token, rolesOptions }) {
  const [errorMessages, setErrorMessages] = React.useState({
    basicOrganizationInfo: "",
    detailledOrganizationInfo: "",
  });

  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";

  const handleSetErrorMessages = (newErrorMessages) => {
    setErrorMessages(newErrorMessages);
    window.scrollTo(0, 0);
  };

  const [organizationInfo, setOrganizationInfo] = React.useState({
    organizationname: "",
    hasparentorganization: false,
    parentorganization: "",
    location: "",
    verified: false,
    shortdescription: "",
    website: "",
    types: [],
  });
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale });
  const steps = ["basicorganizationinfo", "detailledorganizationinfo"];
  const [curStep, setCurStep] = React.useState(steps[0]);
  const locationInputRef = useRef(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = React.useState(false);

  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };

  const handleSetLocationErrorMessage = (newMessage) => {
    handleSetErrorMessages({
      ...errorMessages,
      basicOrganizationInfo: newMessage,
    });
  };

  const handleSetDetailledErrorMessage = (newMessage) => {
    handleSetErrorMessages({
      ...errorMessages,
      detailledOrganizationInfo: newMessage,
    });
  };

  const handleBasicInfoSubmit = async (event, values) => {
    event.preventDefault();
    try {
      //Short circuit if there is no parent organization
      if (values.hasparentorganization && !values.parentOrganization) {
        handleSetErrorMessages({
          ...errorMessages,
          basicOrganizationInfo: texts.you_have_not_selected_a_parent_organization_either_untick,
        });
        return;
      }

      //short circuit if the location is invalid and we're not in legacy mode
      if (!legacyModeEnabled && !isLocationValid(values.location)) {
        indicateWrongLocation(
          locationInputRef,
          setLocationOptionsOpen,
          handleSetLocationErrorMessage,
          texts
        );
        return;
      }
      const resp = await apiRequest({
        method: "get",
        url: "/api/organizations/?search=" + values.organizationname,
        locale: locale,
      });
      if (resp.data.results && resp.data.results.find((r) => r.name === values.organizationname)) {
        const org = resp.data.results.find((r) => r.name === values.organizationname);
        handleSetErrorMessages({
          errorMessages,
          basicOrganizationInfo: (
            <div>
              {texts.an_organization_with_this_name_already_exists}
              <a href={getLocalePrefix(locale) + "/organizations/" + org.url_slug}>
                {texts.click_here}
              </a>{" "}
              {texts.to_see_it}
            </div>
          ),
        });
      } else {
        const location = getLocationValue(values, "location");
        setOrganizationInfo({
          ...organizationInfo,
          name: values.organizationname,
          parentorganization: values.parentorganizationname,
          location: parseLocation(location),
        });
        setCurStep(steps[1]);
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
      return null;
    }
  };

  const requiredPropErrors = {
    image: texts.image_required_error,
    organization_tags: texts.type_required_errror,
    name: texts.name_required_error,
    location: texts.location_required_error,
  };

  const handleDetailledInfoSubmit = async (account) => {
    const organizationToSubmit = await parseOrganizationForRequest(account, user, rolesOptions);
    if (!legacyModeEnabled && !isLocationValid(organizationToSubmit.location)) {
      indicateWrongLocation(
        locationInputRef,
        setLocationOptionsOpen,
        handleSetDetailledErrorMessage,
        texts
      );
      return;
    }
    for (const prop of Object.keys(requiredPropErrors)) {
      if (
        !organizationToSubmit[prop] ||
        (Array.isArray(organizationToSubmit[prop]) && organizationToSubmit[prop].length <= 0)
      ) {
        handleSetErrorMessages({
          errorMessages,
          detailledOrganizationInfo: requiredPropErrors[prop],
        });
        return;
      }
    }
    apiRequest({
      method: "post",
      url: "/api/create_organization/",
      payload: organizationToSubmit,
      token: token,
      locale: locale,
    })
      .then(function (response) {
        Router.push({
          pathname: "/organizations/" + response.data.url_slug,
          query: {
            message: texts.you_have_successfully_created_an_organization_you_can_add_members,
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error?.response?.data);
        if (error?.response?.data?.message)
          handleSetErrorMessages({
            errorMessages,
            detailledOrganizationInfo: error?.response?.data?.message,
          });
      });
  };

  if (!user)
    return (
      <WideLayout
        title={texts.please_log_in + " " + texts.to_create_an_organization}
        hideHeadline={true}
      >
        <LoginNudge fullPage whatToDo={texts.to_create_an_organization} />
      </WideLayout>
    );
  else if (curStep === "basicorganizationinfo")
    return (
      <Layout title={texts.create_an_organization}>
        <EnterBasicOrganizationInfo
          errorMessage={errorMessages.basicOrganizationInfo}
          handleSubmit={handleBasicInfoSubmit}
          organizationInfo={organizationInfo}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
        />
      </Layout>
    );
  else if (curStep === "detailledorganizationinfo")
    return (
      <WideLayout title={texts.create_an_organization}>
        <EnterDetailledOrganizationInfo
          errorMessage={errorMessages.detailledOrganizationInfo}
          handleSubmit={handleDetailledInfoSubmit}
          organizationInfo={organizationInfo}
          tagOptions={tagOptions}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
        />
      </WideLayout>
    );
}

const getRolesOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/roles/",
      token: token,
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

async function getTags(token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizationtags/",
      token: token,
      locale: locale,
    });
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

const parseOrganizationForRequest = async (o, user, rolesOptions) => {
  const organization = {
    team_members: [
      { user_id: user.id, permission_type_id: rolesOptions.find((r) => r.name === "Creator").id },
    ],
    name: o.name,
    background_image: o.background_image,
    image: o.image,
    thumbnail_image: o.thumbnail_image,
    location: o.info.location,
    website: o.info.website,
    short_description: o.info.shortdescription,
    organization_tags: o.types,
  };
  if (o.parentorganization) organization.parent_organization = o.parentorganization;
  if (o.background_image)
    organization.background_image = await blobFromObjectUrl(o.background_image);
  if (o.thumbnail_image) organization.thumbnail_image = await blobFromObjectUrl(o.thumbnail_image);
  if (o.image) organization.image = await blobFromObjectUrl(o.image);
  if (o.info.school) organization.school = o.info.school;
  return organization;
};
