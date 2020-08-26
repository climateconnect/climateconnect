import React from "react";
import Form from "../general/Form";
import { Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import countries from "./../../../public/data/countries.json";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";

const useStyles = makeStyles(theme => ({
  orgBottomLink: {
    textAlign: "center",
    marginTop: theme.spacing(0.5)
  },
  BottomLinkFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing(0.5)
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
  },
  infoIcon: {
    marginRight: theme.spacing(0.5)
  },
  field: {
    marginTop: theme.spacing(3)
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
  const organizationOptions = [...organizations];
  const parent_organization_name = project.parent_organization
    ? project.parent_organization.name
      ? project.parent_organization.name
      : project.parent_organization
    : "";
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
          If your organization does not exist yet{" "}
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
      label: "Title (Use a short, english title, e.g. 'Generating energy from ocean waves')",
      type: "text",
      key: "name",
      value: project.name,
      bottomLink: (
        <Typography className={classes.BottomLinkFlex}>
          <InfoOutlinedIcon className={classes.infoIcon} />
          <Typography component="span">
            Use a title that makes people curious to learn more about your project
          </Typography>
        </Typography>
      )
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
      select: {
        values: countries.map(country => {
          return { key: country, name: country };
        }),
        defaultValue: project.country
      },
      key: "country"
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
    Object.keys(values).map(
      k => (values[k] = values[k] && values[k] != true ? values[k].trim() : values[k])
    );
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
  return (
    <>
      <div className={classes.appealBox}>
        <Typography color="secondary" className={classes.appealText}>
          Please make sure to only use English when sharing a project.
        </Typography>
        <Typography color="secondary" className={classes.appealText}>
          This way most people can benefit from your ideas and experiences to fight climate change
          together!
        </Typography>
      </div>
      <Form
        className={classes.form}
        fields={fields}
        messages={messages}
        onSubmit={onSubmit}
        alignButtonsRight
        fieldClassName={classes.field}
      />
    </>
  );
}
