import React from "react";
import EnterDetailledOrganizationInfo from "./../src/components/organization/EnterDetailledOrganizationInfo";
import EnterBasicOrganizationInfo from "./../src/components/organization/EnterBasicOrganizationInfo";
import Layout from "./../src/components/layouts/layout";
import WideLayout from "./../src/components/layouts/WideLayout";
import Router from "next/router";

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
    //TODO: actually check if organization name is available
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

  const requiredPropErrors = {
    image: 'Please add an avatar image by clicking the "add image" button.',
    type: 'Please choose at least one type by clicking the "add type" button.',
    name: "Please type your organization name under the avatar image",
    location: "Please specify your location"
  };

  const handleDetailledInfoSubmit = (event, account) => {
    for (const prop of Object.keys(requiredPropErrors)) {
      if (!account[prop]) {
        setErrorMessages({
          errorMessages,
          detailledOrganizationInfo: requiredPropErrors[prop]
        });
        return;
      }
    }
    //TODO: save organization and redirect to organization's page.
    Router.push("/organizations/" + "climateconnect");
  };

  if (curStep === "basicorganizationinfo")
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
        />
      </WideLayout>
    );
}
