import React from "react";
import EnterDetailledOrganizationInfo from "./../src/components/organization/EnterDetailledOrganizationInfo";
import EnterBasicOrganizationInfo from "./../src/components/organization/EnterBasicOrganizationInfo";

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
    //TODO: add actually check if organization name is available
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

  const handleDetailledInfoSubmit = (event, values) => {
    console.log(event);
    console.log(values);
    console.log(errorMessages);
    setErrorMessages({
      errorMessages,
      detailledOrganizationInfo: "Your organization name is already taken."
    });
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
        errorMessage={errorMessages.detailledOrganizationInfo}
        handleSubmit={handleDetailledInfoSubmit}
        organizationInfo={organizationInfo}
      />
    );
}
