import React, { useContext } from "react";
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

export default function CreateOrganization({ tagOptions, token, rolesOptions }) {
  const [errorMessages, setErrorMessages] = React.useState({
    basicOrganizationInfo: "",
    detailledOrganizationInfo: ""
  });

  const handleSetErrorMessages = newErrorMessages => {
    setErrorMessages(newErrorMessages);
    window.scrollTo(0, 0);
  };

  const [organizationInfo, setOrganizationInfo] = React.useState({
    organizationname: "",
    hasparentorganization: false,
    parentorganization: "",
    city: "",
    country: "",
    verified: false,
    shortdescription: "",
    website: "",
    types: []
  });
  const { user } = useContext(UserContext);
  const steps = ["basicorganizationinfo", "detailledorganizationinfo"];
  const [curStep, setCurStep] = React.useState(steps[0]);

  const handleBasicInfoSubmit = async (event, values) => {
    event.preventDefault();
    //TODO: actually check if organization name is available
    try {
      if (values.hasparentorganization && !values.parentOrganization)
        handleSetErrorMessages({
          errorMessages,
          basicOrganizationInfo:
            "You have not selected a parent organization. Either untick the sub-organization field or choose/create your parent organization."
        });
      else {
        const resp = await axios.get(
          process.env.API_URL + "/api/organizations/?search=" + values.organizationname
        );
        if (resp.data.results && resp.data.results.find(r => r.name === values.organizationname)) {
          const org = resp.data.results.find(r => r.name === values.organizationname);
          handleSetErrorMessages({
            errorMessages,
            basicOrganizationInfo: (
              <div>
                An organization with this name already exists. Click{" "}
                <a href={"/organizations/" + org.url_slug}>here</a> to see it.
              </div>
            )
          });
        } else {
          setOrganizationInfo({
            ...organizationInfo,
            name: values.organizationname,
            parentorganization: values.parentorganizationname,
            city: values.city,
            country: values.country
          });
          setCurStep(steps[1]);
        }
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
    city: "Please specify your city",
    country: "Please specify your country"
  };

  const handleDetailledInfoSubmit = (event, account) => {
    const organizationToSubmit = parseOrganizationForRequest(account, user, rolesOptions);
    for (const prop of Object.keys(requiredPropErrors)) {
      if (
        !organizationToSubmit[prop] ||
        (Array.isArray(organizationToSubmit[prop]) && organizationToSubmit[prop].length <= 0)
      ) {
        handleSetErrorMessages({
          errorMessages,
          detailledOrganizationInfo: requiredPropErrors[prop]
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
      .then(function(response) {
        Router.push({
          pathname: "/organizations/" + response.data.url_slug,
          query: {
            message:
              "You have successfully created an organization! You can add members by scrolling down to the members section."
          }
        });
      })
      .catch(function(error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  };

  if (!user)
    return (
      <WideLayout title="Please log in to create an organization" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="create an organization" />
      </WideLayout>
    );
  else if (curStep === "basicorganizationinfo")
    return (
      <Layout title="Create an organization">
        <EnterBasicOrganizationInfo
          errorMessage={errorMessages.basicOrganizationInfo}
          handleSubmit={handleBasicInfoSubmit}
          organizationInfo={organizationInfo}
        />
      </Layout>
    );
  else if (curStep === "detailledorganizationinfo")
    return (
      <WideLayout title="Create an organization">
        <EnterDetailledOrganizationInfo
          errorMessage={errorMessages.detailledOrganizationInfo}
          handleSubmit={handleDetailledInfoSubmit}
          organizationInfo={organizationInfo}
          tagOptions={tagOptions}
        />
      </WideLayout>
    );
}

CreateOrganization.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    tagOptions: await getTags(token),
    token: token,
    rolesOptions: await getRolesOptions(token)
  };
};

const getRolesOptions = async token => {
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
      console.log(resp.data.results);
      return resp.data.results.map(t => {
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
      { user_id: user.id, permission_type_id: rolesOptions.find(r => r.name === "Creator").id }
    ],
    name: o.name,
    background_image: o.background_image,
    image: o.image,
    city: o.info.city,
    country: o.info.country,
    website: o.info.website,
    short_description: o.info.shortdescription,
    organization_tags: o.types
  };
  if (o.parentorganization) organization.parent_organization = o.parentorganization;

  if (o.info.school) organization.school = o.info.school;

  return organization;
};
