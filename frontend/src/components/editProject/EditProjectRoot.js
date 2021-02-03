import React, { useRef } from "react";
import { useMediaQuery, Container, Divider } from "@material-ui/core";
import EditProjectOverview from "./EditProjectOverview";
import EditProjectContent from "./EditProjectContent";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "../general/BottomNavigation";
import Router from "next/router";
import axios from "axios";
import tokenConfig from "../../../public/config/tokenConfig";
import { blobFromObjectUrl } from "../../../public/lib/imageOperations";
import { isLocationValid, indicateWrongLocation } from "../../../public/lib/locationOperations";

const useStyles = makeStyles((theme) => {
  return {
    divider: {
      marginBottom: theme.spacing(2),
    },
    bottomNavigation: {
      marginTop: theme.spacing(3),
      minHeight: theme.spacing(2),
    },
  };
});

export default function EditProjectRoot({
  project,
  skillsOptions,
  userOrganizations,
  statusOptions,
  handleSetProject,
  tagsOptions,
  token,
  oldProject,
  user,
  user_role,
  handleSetErrorMessage,
}) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [locationOptionsOpen, setLocationOptionsOpen] = React.useState(false);
  const draftReqiredProperties = {
    name: "Project name",
    loc: "Location",
  };
  const overviewInputsRef = useRef(null);
  const locationInputRef = useRef(null);

  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };

  const checkIfProjectValid = (isDraft) => {
    if (project?.loc && oldProject?.loc !== project.loc && !isLocationValid(project.loc)) {
      overviewInputsRef.current.scrollIntoView();
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, handleSetErrorMessage)
      return false;
    }
    if (isDraft && Object.keys(draftReqiredProperties).filter((key) => !project[key]).length > 0){
      Object.keys(draftReqiredProperties).map((key) => {
        if (!project[key]) {
          alert(
            "Your project draft is missing the following reqired property: " +
              draftReqiredProperties[key]
          );
          return false
        }
      });
    }
    return true
  }

  const onSaveDraft = async () => {
    const valid = checkIfProjectValid(true)
    //short circuit if there is problems with the project
    if(!valid){
      return false
    }    
    axios
      .patch(
        process.env.API_URL + "/api/projects/" + project.url_slug + "/",
        await parseProjectForRequest(getProjectWithoutRedundancies(project, oldProject)),
        tokenConfig(token)
      )
      .then(function () {
        Router.push({
          pathname: "/profiles/" + user.url_slug,
          query: {
            message: "You have successfully edited your project.",
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  };

  const additionalButtons = [
    {
      text: "Save Changes as draft",
      argument: "save",
      onClick: onSaveDraft,
    },
  ];

  const handleCancel = () => {
    Router.push("/projects/" + project.url_slug + "/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const valid = checkIfProjectValid(false)
    //short circuit if there is problems with the project
    if(!valid){
      return false
    }    
    const projectToSubmit = project;
    let was_draft = false;
    if (project.is_draft) {
      projectToSubmit.is_draft = false;
      was_draft = true;
    }

    axios
      .patch(
        process.env.API_URL + "/api/projects/" + project.url_slug + "/",
        await parseProjectForRequest(getProjectWithoutRedundancies(project, oldProject)),
        tokenConfig(token)
      )
      .then(function (response) {
        Router.push({
          pathname: "/projects/" + response.data.url_slug,
          query: {
            message: was_draft
              ? "Your project has been published. Great work!"
              : "You have successfully edited your project.",
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  };

  const deleteProject = () => {
    axios
      .delete(process.env.API_URL + "/api/projects/" + project.url_slug + "/", tokenConfig(token))
      .then(function (response) {
        console.log(response);
        Router.push({
          pathname: "/profiles/" + user.url_slug,
          query: {
            message: "You have successfully deleted your project.",
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <EditProjectOverview
          tagsOptions={tagsOptions}
          project={project}
          smallScreen={isNarrowScreen}
          handleSetProject={handleSetProject}
          overviewInputsRef={overviewInputsRef}
          locationOptionsOpen={locationOptionsOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          locationInputRef={locationInputRef}
        />
        <EditProjectContent
          project={project}
          handleSetProject={handleSetProject}
          statusOptions={statusOptions}
          userOrganizations={userOrganizations}
          skillsOptions={skillsOptions}
          user_role={user_role}
          deleteProject={deleteProject}
        />
        <Divider className={classes.divider} />
        <BottomNavigation
          onClickCancel={handleCancel}
          additionalButtons={project.is_draft && additionalButtons}
          nextStepButtonType={project.is_draft ? "publish" : "save"}
          className={classes.bottomNavigation}
        />
      </form>
    </Container>
  );
}

const getProjectWithoutRedundancies = (newProject, oldProject) => {
  return Object.keys(newProject).reduce((obj, key) => {
    if (newProject[key] !== oldProject[key]) {
      obj[key] = newProject[key];
    }
    return obj;
  }, {});
};

const parseProjectForRequest = async (project) => {
  const ret = {
    ...project,
  };
  if (project.image) ret.image = await blobFromObjectUrl(project.image);
  if (project.thumbnail_image)
    ret.thumbnail_image = await blobFromObjectUrl(project.thumbnail_image);
  if (project.skills) ret.skills = project.skills.map((s) => s.id);
  if (project.tags) ret.project_tags = project.tags.map((t) => t.id);
  if (project.status) ret.status = project.status.id;
  if (project.project_parents && project.project_parents.parent_organization)
    ret.parent_organization = project.project_parents.parent_organization.id;
  return ret;
};
