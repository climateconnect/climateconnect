import React from "react";
import Form from "../general/Form";
import { Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  orgBottomLink: {
    textAlign: "center",
    marginTop: theme.spacing(1)
  }
}))

export default function Share({ project, handleSetProjectData, goToNextStep, userOrganizations }) {
  const classes = useStyles()
  const organizations = !userOrganizations
    ? []
    : userOrganizations.map(org => {
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
      key: "parent_organization",
      bottomLink: <Typography className={classes.orgBottomLink}>If your organization does not exit yet <Link href="/createorganization" underline="always">click here</Link> to create it.</Typography>
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
    console.log(values);
    event.preventDefault();
    Object.keys(values).map(k => (values[k] = values[k].trim()));
    if (values.parent_organization === "Personal project")
      handleSetProjectData({
        ...values,
        isPersonalProject: true
      });
    else
      handleSetProjectData({
        ...values,
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
