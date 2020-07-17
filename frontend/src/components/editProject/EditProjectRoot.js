import React from "react";
import { useMediaQuery, Container, Divider } from "@material-ui/core";
import EditProjectOverview from "./EditProjectOverview";
import EditProjectContent from "./EditProjectContent";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "../general/BottomNavigation";
import Router from "next/router";
import axios from "axios";
import tokenConfig from "../../../public/config/tokenConfig";

const useStyles = makeStyles(theme => {
  return {
    divider: {
      marginBottom: theme.spacing(2)
    },
    bottomNavigation: {
      marginTop: theme.spacing(3),
      height: theme.spacing(2)
    }
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
  oldProject
}) {
  const classes = useStyles()
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  console.log(project)
  const handleCancel = () => {
    Router.push("/projects/" + project.url_slug + "/");
  }

  const handleSubmit = event => {    
    event.preventDefault()
    console.log(parseProjectForRequest(getProjectWithoutRedundancies(project, oldProject)))
    axios
      .patch(
        process.env.API_URL + "/api/projects/" + project.url_slug + "/",
        parseProjectForRequest(getProjectWithoutRedundancies(project, oldProject)),
        tokenConfig(token)
      )
      .then(function(response) {
        Router.push({
          pathname: "/projects/" + response.data.url_slug,
          query: {
            message:
              "You have successfully edited your project."
          }
        });
      })
      .catch(function(error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  }  

  return (
    <Container disableGutters={isNarrowScreen}>
      <form onSubmit={handleSubmit}>
        <EditProjectOverview
          tagsOptions={tagsOptions}
          project={project}
          smallScreen={isNarrowScreen}
          handleSetProject={handleSetProject}
        />
        <EditProjectContent
          project={project}
          handleSetProject={handleSetProject}
          statusOptions={statusOptions}
          userOrganizations={userOrganizations}
          skillsOptions={skillsOptions}
        />
        <Divider className={classes.divider} />
        <BottomNavigation 
          onClickCancel={handleCancel}
          nextStepButtonType="save"
          className={classes.bottomNavigation}
        />
      </form>
    </Container>
  );
}

const getProjectWithoutRedundancies = (newProject, oldProject) => {
  return Object.keys(newProject).reduce((obj, key) => {
    if(newProject[key] !== oldProject[key]){
      obj[key] = newProject[key]
    }
    return obj;
  }, {})
}

const parseProjectForRequest = project => {
  console.log(project)
  const ret = {...project}
  if(project.skills)
    ret.skills = project.skills.map(s=>s.id)
  if(project.tags)
    ret.project_tags = project.tags.map(t=>t.id)
  if(project.status)
    ret.status = project.status.id
  if(project.project_parents && project.project_parents.parent_organization)
    ret.parent_organization = project.project_parents.parent_organization.id
  return ret
}