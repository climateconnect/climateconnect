import React from "react";
import { Typography } from "@material-ui/core";
import WideLayout from "../src/components/layouts/WideLayout";
import Form from "../src/components/general/Form";
import organizationsList from "../public/data/organizations.json";
import { makeStyles } from "@material-ui/core/styles";
import StepsTracker from "../src/components/general/StepsTracker";

const useStyles = makeStyles({
  headline: {
    textAlign: "center"
  },
  stepsTracker: {
    maxWidth: 600,
    margin: "0 auto"
  }
});

export default function EnterDetails() {
  const classes = useStyles();
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
      },
      key: "organization"
    },
    {
      required: true,
      label: "Project name",
      type: "text",
      key: "projectname"
    },
    {
      required: true,
      label: "Location",
      type: "text",
      key: "location"
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

  const steps = [
    {
      key: "share",
      text: "share project"
    },
    {
      key: "category",
      text: "project category"
    },
    {
      key: "details",
      text: "project details"
    }
  ];

  return (
    <WideLayout title="Share a project" hideHeadline={true}>
      <StepsTracker
        grayBackground={true}
        className={classes.stepsTracker}
        steps={steps}
        activeStep={steps[0].key}
      />
      <Typography variant="h4" color="primary" className={classes.headline}>
        Share a project
      </Typography>
      <Form fields={fields} messages={messages} formAction={formAction} alignButtonsRight />
    </WideLayout>
  );
}
