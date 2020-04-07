import React from "react";
import Layout from "./../layouts/layout";
import Form from "./../general/Form";

export default function EnterBasicOrganizationInfo({
  errorMessage,
  handleSubmit,
  organizationInfo
}) {
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
