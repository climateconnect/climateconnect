import React from "react";
import Form from "../general/Form";

export default function Share({ project, handleSetProjectData, goToNextStep, userOrganizations }) {
  //TODO: This should include only organizations in which the user is an admin
  const organizations = userOrganizations.map(org => {
    return {
      key: org.url_slug,
      ...org
    };
  });
  const organizationOptions = [
    { key: "personalproject", name: "Personal project" },
    ...organizations
  ];
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

  const getOrgObject = org => {
    return userOrganizations.find(o => o.name === org);
  };

  const onSubmit = (event, values) => {
    event.preventDefault();
    if (values.parent_organization === "Personal project")
      handleSetProjectData({
        ...values.map(v => v.trim()),
        isPersonalProject: true
      });
    else
      handleSetProjectData({
        ...values.map(v => v.trim()),
        parent_organization: getOrgObject(values.parent_organization)
      });
    goToNextStep();
  };

  return (
    <>
      <Form fields={fields} messages={messages} onSubmit={onSubmit} alignButtonsRight />
    </>
  );
}
