import React from "react";
import Layout from "../src/components/layouts/layout";
import Form from "./../src/components/general/Form";
import organizationsList from "./../public/data/organizations.json";

export default function Create() {
  //TODO: This should include only organizations in which the user is an admin
  const organizations = organizationsList.organizations.map(org => {
    return {
      key: org.url,
      name: org.name
    };
  });
  const organizationOptions = [{ key: "personal", name: "Personal project" }, ...organizations];
  const fields = [
    {
      required: true,
      label: "Organization",
      select: {
        values: organizationOptions
      }
    },
    {
      required: true,
      label: "Project name",
      type: "text"
    },
    {
      required: true,
      label: "Location",
      type: "text"
    }
  ];

  const messages = {
    submitMessage: "Next Step"
  };

  //dummy route while we don't have backend
  const formAction = {
    href: "/",
    method: "GET"
  };

  return (
    <Layout title="Create a project">
      <Form
        fields={fields}
        messages={messages}
        formAction={formAction}
        usePercentage={true}
        percentage={0}
      />
    </Layout>
  );
}
