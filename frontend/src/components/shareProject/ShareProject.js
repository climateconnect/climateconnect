import React from "react";
import Form from "../general/Form";
import { Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  orgBottomLink: {
    textAlign: "center",
    marginTop: theme.spacing(1)
  },
  appealText: {
    textAlign: "center",
    fontWeight: "bold"
  },
  appealBox: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  form: {
    maxWidth: 700,
    margin: "0 auto",
    padding: theme.spacing(4),
    paddingTop: theme.spacing(2)
  }
}));

export default function Share({ project, handleSetProjectData, goToNextStep, userOrganizations }) {
  const classes = useStyles();
  const organizations = !userOrganizations
    ? []
    : userOrganizations.map(org => {
        return {
          key: org.url_slug,
          ...org
        };
      });
  const organizationOptions = [
    ...organizations
  ];
  const parent_organization_name = project.parent_organization ? (project.parent_organization.name ? project.parent_organization.name : project.parent_organization) : ""
  const fields = [
    {
      falseLabel: "Personal Project",
      trueLabel: "Organization's project",
      key: "is_organization_project",
      type: "switch",
      checked: project.is_organization_project 
    },
    {
      required: true,
      label: "Organization",
      select: {
        values: organizationOptions,
        defaultValue: parent_organization_name
      },
      key: "parent_organization",
      bottomLink: (
        <Typography className={classes.orgBottomLink}>
          If your organization does not exit yet{" "}
          <Link href="/createorganization" underline="always">
            click here
          </Link>{" "}
          to create it.
        </Typography>
      ),
      onlyShowIfChecked: "is_organization_project"
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
    Object.keys(values).map(k => (values[k] = values[k] && values[k] != true ? values[k].trim() : values[k]));
    if (!values.parent_organization)
      handleSetProjectData({
        ...values,
        isPersonalProject: true
      });
    else
      handleSetProjectData({
        ...values,
        parent_organization: getOrgObject(values.parent_organization),
        isPersonalProject: false
      });
    goToNextStep();
  };
  console.log(project)
  return (
    <>
      <div className={classes.appealBox}>
        <Typography color="secondary" className={classes.appealText}>Please make sure to only use English when sharing a project.</Typography>
        <Typography color="secondary" className={classes.appealText}>This way most people can benefit from your ideas and experiences to fight climate change together!</Typography>
      </div>   
      <Form className={classes.form} fields={fields} messages={messages} onSubmit={onSubmit} alignButtonsRight />
    </>
  );
}
