import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import Router from "next/router";
import React, { useContext, useEffect } from "react";
import tokenConfig from "../../../public/config/tokenConfig";
import { blobFromObjectUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import StepsTracker from "./../general/StepsTracker";
import AddTeam from "./AddTeam";
import EnterDetails from "./EnterDetails";
import ProjectSubmittedPage from "./ProjectSubmittedPage";
import SelectCategory from "./SelectCategory";
import ShareProject from "./ShareProject";
const DEFAULT_STATUS = 2;

const useStyles = makeStyles((theme) => {
  return {
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto",
    },
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4),
    },
  };
});

const getSteps = (texts) => [
  {
    key: "share",
    text: "share project",
    headline: texts.share_a_project,
  },
  {
    key: "selectCategory",
    text: "project category",
    headline: texts.select_1_to_3_categories_that_fit_your_project,
  },
  {
    key: "enterDetails",
    text: texts.project_details,
  },
  {
    key: "addTeam",
    text: "add team",
    headline: texts.add_your_team,
  },
];

export default function ShareProjectRoot({
  availabilityOptions,
  userOrganizations,
  categoryOptions,
  skillsOptions,
  rolesOptions,
  user,
  statusOptions,
  token,
  setMessage,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const steps = getSteps(texts);
  const [project, setProject] = React.useState(
    getDefaultProjectValues(
      {
        ...user,
        role: rolesOptions.find((r) => r.name === "Creator"),
        role_in_project: "",
      },
      statusOptions,
      userOrganizations
    )
  );
  const [curStep, setCurStep] = React.useState(steps[0]);
  const [finished, setFinished] = React.useState(false);

  useEffect(() => {
    if (window) {
      const location = window.location.href;
      Router.beforePopState(({ as }) => {
        if (location.includes("/share") && as != "/share") {
          const result = window.confirm(
            texts.are_you_sure_you_want_to_leave_you_will_lose_your_project
          );
          if (!result) {
            return false;
          }
        }
        return true;
      });
    }
  });

  const goToNextStep = () => {
    setCurStep(steps[steps.indexOf(curStep) + 1]);
    setMessage("");
    //scroll to top when navigating to another step
    window.scrollTo(0, 0);
  };

  const goToPreviousStep = () => {
    setCurStep(steps[steps.indexOf(curStep) - 1]);
    setMessage("");
    //scroll to top when navigating to another step
    window.scrollTo(0, 0);
  };

  const submitProject = async (event) => {
    event.preventDefault();
    axios
      .post(
        process.env.API_URL + "/api/create_project/",
        await formatProjectForRequest(project),
        tokenConfig(token)
      )
      .then(function (response) {
        setProject({ ...project, url_slug: response.data.url_slug });
      })
      .catch(function (error) {
        console.log(error);
        setProject({ ...project, error: true });
        if (error) console.log(error.response);
      });
    setFinished(true);
  };

  const saveAsDraft = async (event) => {
    event.preventDefault();
    axios
      .post(
        process.env.API_URL + "/api/create_project/",
        await formatProjectForRequest({ ...project, is_draft: true }),
        tokenConfig(token)
      )
      .then(function (response) {
        setProject({ ...project, url_slug: response.data.url_slug, is_draft: true });
      })
      .catch(function (error) {
        console.log(error);
        setProject({ ...project, error: true });
        if (error) console.log(error.response);
      });
    setFinished(true);
  };

  const handleSetProject = (newProjectData) => {
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
              setMessage={setMessage}
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
          <ProjectSubmittedPage
            user={user}
            isDraft={project.is_draft}
            url_slug={project.url_slug}
            hasError={project.error}
          />
        </>
      )}
    </>
  );
}

//TODO: remove some of these default values as they are just for testing
const getDefaultProjectValues = (loggedInUser, statusOptions, userOrganizations) => {
  return {
    collaborators_welcome: true,
    status: statusOptions.find((s) => s.id === DEFAULT_STATUS),
    skills: [],
    helpful_connections: [],
    collaborating_organizations: [],
    loc: {},
    parent_organization: userOrganizations ? userOrganizations[0] : null,
    isPersonalProject: !(userOrganizations && userOrganizations.length > 0),
    is_organization_project: userOrganizations && userOrganizations.length > 0,
    //TODO: Should contain the logged in user as the creator and parent_user by default
    team_members: [{ ...loggedInUser }],
    website: "",
  };
};

const formatProjectForRequest = async (project) => {
  return {
    ...project,
    status: project.status.id,
    skills: project.skills.map((s) => s.key),
    team_members: project.team_members.map((m) => ({
      url_slug: m.url_slug,
      role: m.role.id,
      availability: m.availability.id,
      id: m.id,
      role_in_project: m.role_in_project,
    })),
    project_tags: project.project_tags.map((s) => s.key),
    parent_organization: project.parent_organization.id,
    collaborating_organizations: project.collaborating_organizations.map((o) => o.id),
    image: await blobFromObjectUrl(project.image),
    thumbnail_image: await blobFromObjectUrl(project.thumbnail_image),
  };
};
