import React from "react";
import Form from "../general/Form";
import organizationsList from "../../../public/data/organizations.json";

export default function Share({ project, setProject, goToNextStep }) {
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
        values: organizationOptions,
        defaultValue: project.parent_organization
      },
      key: "parent_organization"
    },
    {
      required: true,
      label: "Project name",
      type: "text",
      key: "name",
      value: project.name
    },
    {
      required: true,
      label: "Location",
      type: "text",
      key: "city",
      value: project.city
    },
    {
      required: true,
      label: "Country",
      type: "text",
      key: "country",
      value: project.country
    }
  ];

  const messages = {
    submitMessage: "Next Step"
  };

  const onSubmit = (event, values) => {
    event.preventDefault();
    console.log(values);
    setProject({ ...project, ...values });
    goToNextStep();
  };

  return (
    <>
      <Form fields={fields} messages={messages} onSubmit={onSubmit} alignButtonsRight />
    </>
  );
}
