import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
const DEFAULT_STATUS = 2;
import ShareProject from "./ShareProject";
import StepsTracker from "./../general/StepsTracker";
import SelectCategory from "./SelectCategory";
import EnterDetails from "./EnterDetails";
import AddTeam from "./AddTeam";
import ProjectSubmittedPage from "./ProjectSubmittedPage";
import axios from "axios";
import tokenConfig from "../../../public/config/tokenConfig";

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
    headline: "Select 1-3 categories that fit your project"
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
  statusOptions,
  token
}) {
  const classes = useStyles();
  const [project, setProject] = React.useState(
    getDefaultProjectValues(
      {
        ...user,
        role: rolesOptions.find(r => r.name === "Creator"),
        role_in_project: ""
      },
      statusOptions,
      userOrganizations
    )
  );
  const [curStep, setCurStep] = React.useState(steps[0]);
  const [finished, setFinished] = React.useState(false);

  const goToNextStep = () => {
    setCurStep(steps[steps.indexOf(curStep) + 1]);
    //scroll to top when navigating to another step
    window.scrollTo(0, 0);
  };

  const goToPreviousStep = () => {
    setCurStep(steps[steps.indexOf(curStep) - 1]);
    //scroll to top when navigating to another step
    window.scrollTo(0, 0);
  };

  const submitProject = event => {
    event.preventDefault();
    console.log(formatProjectForRequest(project));
    axios
      .post(
        process.env.API_URL + "/api/create_project/",
        formatProjectForRequest(project),
        tokenConfig(token)
      )
      .then(function(response) {
        setProject({ ...project, url_slug: response.data.url_slug });
      })
      .catch(function(error) {
        console.log(error);
        if (error) console.log(error.response);
      });
    setFinished(true);
  };

  const saveAsDraft = event => {
    event.preventDefault();
    console.log(project);
    setProject({ ...project, is_draft: true });
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
          <ProjectSubmittedPage isDraft={project.is_draft} url_slug={project.url_slug} />
        </>
      )}
    </>
  );
}

//TODO: remove some of these default values as they are just for testing
const getDefaultProjectValues = (loggedInUser, statusOptions, userOrganizations) => {
  return {
    collaborators_welcome: true,
    status: statusOptions.find(s => s.id === DEFAULT_STATUS),
    skills: [],
    helpful_connections: [],
    collaborating_organizations: [],
    isPersonalProject: !(userOrganizations && userOrganizations.length > 0),
    is_organization_project: userOrganizations && userOrganizations.length > 0,
    //TODO: Should contain the logged in user as the creator and parent_user by default
    team_members: [{ ...loggedInUser }]
  };
};

const formatProjectForRequest = project => {
  return {
    ...project,
    status: project.status.id,
    skills: project.skills.map(s => s.key),
    team_members: project.team_members.map(m => ({
      url_slug: m.url_slug,
      role: m.role.id,
      availability: m.availability.id,
      id: m.id,
      role_in_project: m.role_in_project
    })),
    project_tags: project.project_tags.map(s => s.key),
    parent_organization: project.parent_organization.id,
    collaborating_organizations: project.collaborating_organizations.map(o => o.id)
  };
};
