import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import WideLayout from "../src/components/layouts/WideLayout";
import StepsTracker from "../src/components/general/StepsTracker";
import ShareProject from "../src/components/shareProject/ShareProject";
import SelectCategory from "../src/components/shareProject/SelectCategory";
import EnterDetails from "../src/components/shareProject/EnterDetails";

const DEFAULT_STATUS = "inprogress";

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
    key: "selectCategory",
    text: "project category",
    headline: "Select your project's category"
  },
  {
    key: "enterDetails",
    text: "project details"
  },
  {
    key: "addTeam",
    text: "add team",
    headline: "Add your team"
  }
];

export default function Share() {
  const classes = useStyles();
  const [project, setProject] = React.useState(defaultProjectValues);
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
        activeStep={curStep.key}
      />
      <Typography variant="h4" color="primary" className={classes.headline}>
        {curStep.headline ? curStep.headline : project.name}
      </Typography>
      {curStep.key === "share" && (
        <ShareProject project={project} setProject={setProject} goToNextStep={goToNextStep} />
      )}
      {curStep.key === "selectCategory" && (
        <SelectCategory
          project={project}
          setProject={setProject}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
        />
      )}
      {curStep.key === "enterDetails" && (
        <EnterDetails
          projectData={project}
          setProjectData={setProject}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
        />
      )}
    </WideLayout>
  );
}

const defaultProjectValues = {
  collaborators_welcome: true,
  status: DEFAULT_STATUS,
  skills: [],
  connections: []
};
