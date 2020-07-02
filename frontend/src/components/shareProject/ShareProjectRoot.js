import React from "react"
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
const DEFAULT_STATUS = "In Progress";
import ShareProject from "./ShareProject"
import StepsTracker from "./../general/StepsTracker"
import SelectCategory from "./SelectCategory"
import EnterDetails from "./EnterDetails"
import AddTeam from "./AddTeam"
import ProjectSubmittedPage from "./ProjectSubmittedPage"

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

export default function ShareProjectRoot({
  availabilityOptions,
  userOrganizations,
  categoryOptions,
  skillsOptions,
  rolesOptions,
  user,
  statusOptions
}) {
    const classes = useStyles();
    const [project, setProject] = React.useState(
      getDefaultProjectValues({ ...user, role: rolesOptions.find(r => r.name === "Creator") })
    );
    const [curStep, setCurStep] = React.useState(steps[0]);
    const [finished, setFinished] = React.useState(false);

    const goToNextStep = () => {
      console.log(project);
      setCurStep(steps[steps.indexOf(curStep) + 1]);
    };

    const goToPreviousStep = () => {
      setCurStep(steps[steps.indexOf(curStep) - 1]);
    };

    const submitProject = event => {
      console.log("submitting project");
      console.log(project);
      //TODO: make a request to publish the project
      event.preventDefault();
      //setFinished(true);
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
      <>
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
                userOrganizations={userOrganizations}
              />
            )}
            {curStep.key === "selectCategory" && (
              <SelectCategory
                project={project}
                handleSetProjectData={handleSetProject}
                goToNextStep={goToNextStep}
                goToPreviousStep={goToPreviousStep}
                categoryOptions={categoryOptions}
              />
            )}
            {curStep.key === "enterDetails" && (
              <EnterDetails
                projectData={project}
                handleSetProjectData={handleSetProject}
                goToNextStep={goToNextStep}
                goToPreviousStep={goToPreviousStep}
                skillsOptions={skillsOptions}
                statusOptions={statusOptions}
              />
            )}
            {curStep.key === "addTeam" && (
              <AddTeam
                projectData={project}
                handleSetProjectData={handleSetProject}
                onSubmit={submitProject}
                saveAsDraft={saveAsDraft}
                goToPreviousStep={goToPreviousStep}
                availabilityOptions={availabilityOptions}
                rolesOptions={rolesOptions}
              />
            )}
          </>
        ) : (
          <>
            <ProjectSubmittedPage isDraft={project.isDraft} url_slug={project.url_slug} />
          </>
        )}
      </>
    );  
}

//TODO: remove some of these default values as they are just for testing
const getDefaultProjectValues = loggedInUser => ({
    collaborators_welcome: true,
    status: DEFAULT_STATUS,
    skills: [],
    helpful_connections: [],
    collaborating_organizations: [],
    isPersonalProject: true,
    //TODO: Should contain the logged in user as the creator and parent_user by default
    team_members: [loggedInUser]
  });
  