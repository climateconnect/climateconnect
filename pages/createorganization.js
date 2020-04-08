import React from "react";
import EnterDetailledOrganizationInfo from "./../src/components/organization/EnterDetailledOrganizationInfo";
import EnterBasicOrganizationInfo from "./../src/components/organization/EnterBasicOrganizationInfo";
import Layout from "./../src/components/layouts/layout";
import WideLayout from "./../src/components/layouts/WideLayout";

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
  const [curStep, setCurStep] = React.useState(steps[1]);

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

  const requiredProps = ["image", "type"];

  const handleDetailledInfoSubmit = (event, account) => {
    console.log(event);
    console.log(account);
    for (const prop of requiredProps) {
      if (!account[prop]) {
        setErrorMessages({
          errorMessages,
          detailledOrganizationInfo: "Please specify this prop: " + prop
        });
        return;
      }
    }
    setErrorMessages({
      errorMessages,
      detailledOrganizationInfo: "Your organization name is already taken."
    });
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
