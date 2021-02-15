import React, { useContext, useRef } from "react";
import EnterDetailledOrganizationInfo from "./../src/components/organization/EnterDetailledOrganizationInfo";
import EnterBasicOrganizationInfo from "./../src/components/organization/EnterBasicOrganizationInfo";
import Layout from "./../src/components/layouts/layout";
import WideLayout from "./../src/components/layouts/WideLayout";
import axios from "axios";
import Cookies from "next-cookies";
import tokenConfig from "../public/config/tokenConfig";
import LoginNudge from "../src/components/general/LoginNudge";
import UserContext from "../src/components/context/UserContext";
import Router from "next/router";
import {
  isLocationValid,
  indicateWrongLocation,
  parseLocation,
  getLocationValue,
} from "../public/lib/locationOperations";

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
  const { user } = useContext(UserContext);
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
          basicOrganizationInfo:
            "You have not selected a parent organization. Either untick the sub-organization field or choose/create your parent organization.",
        });
        return;
      }

      //short circuit if the location is invalid and we're not in legacy mode
      if (!legacyModeEnabled && !isLocationValid(values.location)) {
        indicateWrongLocation(
          locationInputRef,
          setLocationOptionsOpen,
          handleSetLocationErrorMessage
        );
        return;
      }
      const resp = await axios.get(
        process.env.API_URL + "/api/organizations/?search=" + values.organizationname
      );
      if (resp.data.results && resp.data.results.find((r) => r.name === values.organizationname)) {
        const org = resp.data.results.find((r) => r.name === values.organizationname);
        handleSetErrorMessages({
          errorMessages,
          basicOrganizationInfo: (
            <div>
              An organization with this name already exists. Click{" "}
              <a href={"/organizations/" + org.url_slug}>here</a> to see it.
            </div>
          ),
        });
      } else {
        const location = getLocationValue(values, "location")
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
    image: 'Please add an avatar image by clicking the "Add Image" button.',
    organization_tags:
      'Please choose at least one organization type by clicking the "Add Type" button under the avatar.',
    name: "Please type your organization name under the avatar image",
    location: "Please specify your location",
  };

  const handleDetailledInfoSubmit = (account) => {
    const organizationToSubmit = parseOrganizationForRequest(account, user, rolesOptions);
    if (!legacyModeEnabled && !isLocationValid(organizationToSubmit.location)) {
      indicateWrongLocation(
        locationInputRef,
        setLocationOptionsOpen,
        handleSetDetailledErrorMessage
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
    axios
      .post(
        process.env.API_URL + "/api/create_organization/",
        organizationToSubmit,
        tokenConfig(token)
      )
      .then(function (response) {
        Router.push({
          pathname: "/organizations/" + response.data.url_slug,
          query: {
            message:
              "You have successfully created an organization! You can add members by scrolling down to the members section.",
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error.response.data);
        handleSetErrorMessages({
          errorMessages,
          detailledOrganizationInfo: error?.response?.data,
        });
      });
  };

  if (!user)
    return (
      <WideLayout title="Please Log In to Create an Organization" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="create an organization" />
      </WideLayout>
    );
  else if (curStep === "basicorganizationinfo")
    return (
      <Layout title="Create an Organization">
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
      <WideLayout title="Create an Organization">
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

CreateOrganization.getInitialProps = async (ctx) => {
  const { token } = Cookies(ctx);
  const [tagOptions, rolesOptions] = await Promise.all([
    await getTags(token),
    await getRolesOptions(token),
  ]);
  return {
    tagOptions: tagOptions,
    token: token,
    rolesOptions: rolesOptions,
  };
};

const getRolesOptions = async (token) => {
  try {
    const resp = await axios.get(process.env.API_URL + "/roles/", tokenConfig(token));
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

async function getTags(token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizationtags/",
      tokenConfig(token)
    );
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

const parseOrganizationForRequest = (o, user, rolesOptions) => {
  const organization = {
    team_members: [
      { user_id: user.id, permission_type_id: rolesOptions.find((r) => r.name === "Creator").id },
    ],
    name: o.name,
    background_image: o.background_image,
    image: o.image,
    location: o.info.location,
    website: o.info.website,
    short_description: o.info.shortdescription,
    organization_tags: o.types,
  };
  if (o.parentorganization) organization.parent_organization = o.parentorganization;

  if (o.info.school) organization.school = o.info.school;

  return organization;
};
