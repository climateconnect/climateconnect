import React from "react";
import EnterDetailledOrganizationInfo from "./../src/components/organization/EnterDetailledOrganizationInfo";
import EnterBasicOrganizationInfo from "./../src/components/organization/EnterBasicOrganizationInfo";
import Layout from "./../src/components/layouts/layout";
import WideLayout from "./../src/components/layouts/WideLayout";
import Router from "next/router";
import axios from "axios"

export default function CreateOrganization() {
  const [errorMessages, setErrorMessages] = React.useState({
    basicOrganizationInfo: "",
    detailledOrganizationInfo: ""
  });

  const [organizationInfo, setOrganizationInfo] = React.useState({
    organizationname: "",
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

  const handleBasicInfoSubmit = async(event, values) => {
    event.preventDefault();
    //TODO: actually check if organization name is available
    try {
      if(!values.parentOrganization)
        setErrorMessages({
          errorMessages,
          basicOrganizationInfo: "You have not selected a parent organization. Either untick the sub-organization field or choose/create your parent organization."
        });
      else{
        const resp = await axios.get(process.env.API_URL + "/api/organizations/?search="+values.organizationname);
        if(resp.data.results && resp.data.results.find(r=>r.name === values.organizationname)){
          setErrorMessages({
            errorMessages,
            basicOrganizationInfo: <div>An organization with this name already exists. Click <a href={"/organizations/"+resp.data.results.find(r=>r.name === values.name).url_slug}>here</a> to see it.</div>
          });
        }else {
          setOrganizationInfo({
            ...organizationInfo,
            name: values.organizationname,
            parentorganization: values.parentorganizationname,
            location: values.city + ", " + values.country
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
