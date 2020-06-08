import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import WideLayout from "../src/components/layouts/WideLayout";
import StepsTracker from "../src/components/general/StepsTracker";
import ShareProject from "../src/components/shareProject/ShareProject";
import SelectCategory from "../src/components/shareProject/SelectCategory";
import EnterDetails from "../src/components/shareProject/EnterDetails";
import AddTeam from "../src/components/shareProject/AddTeam";
//TODO: this should be retrieved asynchronously, e.g. via getInitialProps
import organizationsList from "../public/data/organizations.json";
import ProjectSubmittedPage from "../src/components/shareProject/ProjectSubmittedPage";
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
  const [finished, setFinished] = React.useState(false);

  const goToNextStep = () => {
    setCurStep(steps[steps.indexOf(curStep) + 1]);
  };

  const goToPreviousStep = () => {
    setCurStep(steps[steps.indexOf(curStep) - 1]);
  };

  const submitProject = event => {
    //TODO: make a request to publish the project
    event.preventDefault();
    setFinished(true);
  };

  const saveAsDraft = event => {
    event.preventDefault();
    setProject({ ...project, isDraft: true });
    setFinished(true);
  };

  const handleSetProject = newProjectData => {
    setProject({ ...project, ...newProjectData });
  };

  return (
    <WideLayout title="Share a project" hideHeadline={true}>
      {!finished ? (
        <>
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
            <ShareProject
              project={project}
              handleSetProjectData={handleSetProject}
              goToNextStep={goToNextStep}
              userOrganizations={organizationsList.organizations.filter(
                o => o.url_slug === "sneeperlangen"
              )}
            />
          )}
          {curStep.key === "selectCategory" && (
            <SelectCategory
              project={project}
              handleSetProjectData={handleSetProject}
              goToNextStep={goToNextStep}
              goToPreviousStep={goToPreviousStep}
            />
          )}
          {curStep.key === "enterDetails" && (
            <EnterDetails
              projectData={project}
              handleSetProjectData={handleSetProject}
              goToNextStep={goToNextStep}
              goToPreviousStep={goToPreviousStep}
            />
          )}
          {curStep.key === "addTeam" && (
            <AddTeam
              projectData={project}
              handleSetProjectData={handleSetProject}
              submit={submitProject}
              saveAsDraft={saveAsDraft}
              goToPreviousStep={goToPreviousStep}
            />
          )}
        </>
      ) : (
        <>
          <ProjectSubmittedPage isDraft={project.isDraft} url_slug={project.url_slug} />
        </>
      )}
    </WideLayout>
  );
}

//TODO: remove some of these default values as they are just for testing
const defaultProjectValues = {
  collaborators_welcome: true,
  status: DEFAULT_STATUS,
  skills: [],
  connections: [],
  collaboratingOrganizations: [],
  //TODO: Should contain the logged in user as the creator by default
  members: [
    {
      first_name: "Christoph",
      last_name: "Stoll",
      url_slug: "christophstoll",
      image: "images/christophstoll.jpg",
      permissions: {
        key: "creator",
        name: "Creator"
      }
    }
  ]
};
