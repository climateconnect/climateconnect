import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import WideLayout from "../src/components/layouts/WideLayout";
import StepsTracker from "../src/components/general/StepsTracker";
import ShareProject from "../src/components/shareProject/ShareProject";

const useStyles = makeStyles(theme => {
  return {
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto"
    },
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4)
    }
  };
});

const steps = [
  {
    key: "share",
    text: "share project",
    headline: "Share a project"
  },
  {
    key: "category",
    text: "project category",
    headline: "Select your project's category"
  },
  {
    key: "details",
    text: "project details"
  }
];

export default function Share() {
  const classes = useStyles();
  const [project, setProject] = React.useState({});
  const [curStep, setCurStep] = React.useState(steps[0]);

  const goToNextStep = () => {
    setCurStep(steps[steps.indexOf(curStep) + 1]);
  };

  const goToPreviousStep = () => {
    setCurStep(steps[steps.indexOf(curStep) - 1]);
  };

  return (
    <WideLayout title="Share a project" hideHeadline={true}>
      <StepsTracker
        grayBackground={true}
        className={classes.stepsTracker}
        steps={steps}
        activeStep={steps[0].key}
      />
      <Typography variant="h4" color="primary" className={classes.headline}>
        {curStep.headline}
      </Typography>
      <ShareProject
        project={project}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
        setProject={setProject}
      />
    </WideLayout>
  );
}
