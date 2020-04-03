import React from "react";
import Router from "next/router";
import Layout from "../src/components/layouts/layout";
import Form from "./../src/components/general/Form";
import EditAccountPage from "./../src/components/account/EditAccountPage";
import organization_info_metadata from "./../public/data/organization_info_metadata.json";
import organization_types from "./../public/data/organization_types.json";

/*
  Organization name
  "we are a subgroup of a larger organization"
  if yes: parent organization
  location
  Description
  organization type and potential additional infos
  members
  projects
*/

export default function CreateOrganization() {
  const [errorMessages, setErrorMessages] = React.useState({
    basicOrganizationInfo: "",
    detailledOrganizationInfo: ""
  });

  const [organizationInfo, setOrganizationInfo] = React.useState({
    name: "",
    hasparentorganization: false,
    parentorganization: "",
    location: "",
    city: "",
    verified: false,
    shortdescription: "",
    types: []
  });
  const steps = ["basicorganizationinfo", "detailledorganizationinfo"];
  const [curStep, setCurStep] = React.useState(steps[0]);

  const handleBasicInfoSubmit = (event, values) => {
    event.preventDefault();
    if (values.organizationname === "Climate Connect")
      setErrorMessages({
        errorMessages,
        basicOrgainzationInfo: "Your organization name is already taken."
      });
    else {
      setOrganizationInfo({
        ...organizationInfo,
        name: values.organizationname,
        parentorganization: values.parentorganizationname,
        location: values.city + ", " + values.country
      });
      setCurStep(steps[1]);
    }
  };

  if (curStep === "basicorganizationinfo")
    return (
      <EnterBasicOrganizationInfo
        errorMessage={errorMessages.basicOrganizationInfo}
        handleSubmit={handleBasicInfoSubmit}
        organizationInfo={organizationInfo}
      />
    );
  else if (curStep === "detailledorganizationinfo")
    return (
      <EnterDetailledOrganizationInfo
        errorMessage={errorMessages.basicOrganizationInfo}
        handleSubmit={handleBasicInfoSubmit}
        organizationInfo={organizationInfo}
      />
    );
}

function EnterBasicOrganizationInfo({ errorMessage, handleSubmit, organizationInfo }) {
  const fields = [
    {
      required: true,
      label: "Organization name",
      key: "organizationname",
      type: "text",
      value: organizationInfo["organizationname"]
    },
    {
      label: "We are a sub-organization of a larger organization (e.g. local group)",
      key: "hasparentorganization",
      type: "checkbox",
      checked: false,
      value: organizationInfo["hasparentorganization"]
    },
    {
      required: true,
      label: "Parent organization name",
      key: "parentorganizationname",
      type: "text",
      onlyShowIfChecked: "hasparentorganization",
      value: organizationInfo["parentorganizationname"]
    },
    {
      required: true,
      label: "Country",
      key: "country",
      type: "text",
      value: organizationInfo["country"]
    },
    {
      required: true,
      label: "City",
      key: "city",
      type: "text",
      value: organizationInfo["city"]
    },
    {
      required: true,
      label: `I verify that I am an authorized representative of this organization and have the right to act on its behalf in the creation and management of this page.`,
      key: "verified",
      type: "checkbox",
      value: organizationInfo["verified"]
    }
  ];

  const messages = {
    submitMessage: "Next step"
  };

  return (
    <div>
      <Layout title="Create an organization">
        <Form
          fields={fields}
          messages={messages}
          usePercentage={false}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
        />
      </Layout>
    </div>
  );
}

const parseOrganizationInfo = info => {
  const ret = { info: {} };
  Object.keys(info).map(key => {
    if (organization_info_metadata[key]) ret.info[key] = info[key];
    else ret[key] = info[key];
  });
  return ret;
};

function EnterDetailledOrganizationInfo({
  //errorMessage,
  organizationInfo
  //handleSubmit,
  //handleGoBack
}) {
  const organization = parseOrganizationInfo(organizationInfo);

  const handleCreateOrganization = () => {
    console.log("another one.");
  };

  const handleCancel = () => {
    Router.push("/");
  };

  return (
    <EditAccountPage
      type="organization"
      account={organization}
      possibleAccountTypes={organization_types.organization_types}
      infoMetadata={organization_info_metadata}
      maxAccountTypes={organization_types.max_types}
      accountHref={"/organizations/" + organization.url}
      handleSubmit={handleCreateOrganization}
      submitMessage="Create"
      handleCancel={handleCancel}
    />
  );
}
