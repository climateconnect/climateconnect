import React from "react";
import { Typography } from "@material-ui/core";
import WideLayout from "../src/components/layouts/WideLayout";
import MultiLevelSelector from "../src/components/project/MultiLevelSelector";
import { makeStyles } from "@material-ui/core/styles";
import StepsTracker from "../src/components/general/StepsTracker";
import project_categories from "../public/data/project_categories.json";

const useStyles = makeStyles({
  headline: {
    textAlign: "center"
  },
  stepsTracker: {
    maxWidth: 600,
    margin: "0 auto"
  }
});

export default function Create() {
  const classes = useStyles();

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
    <WideLayout title="Select your project's category" hideHeadline={true}>
      <StepsTracker
        grayBackground={true}
        className={classes.stepsTracker}
        steps={steps}
        activeStep={steps[0].key}
      />
      <Typography variant="h4" color="primary" className={classes.headline}>
        {"Select your project's category"}
      </Typography>
      <MultiLevelSelector itemsToSelectFrom={project_categories} maxSelections={3} />
    </WideLayout>
  );
}
