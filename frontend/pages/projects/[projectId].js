import React from "react";
import Link from "next/link";
import { Container, Tabs, Tab } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "next-cookies";

import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectOverview from "../../src/components/project/ProjectOverview";
import ProjectContent from "../../src/components/project/ProjectContent";
import ProjectTeamContent from "../../src/components/project/ProjectTeamContent";
import ProjectCommentsContent from "../../src/components/project/ProjectCommentsContent";

import tokenConfig from "../../public/config/tokenConfig";
import axios from "axios";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    color: theme.palette.grey[800]
  },
  tabsWrapper: {
    borderBottom: `1px solid ${theme.palette.grey[500]}`
  },
  noPadding: {
    padding: 0
  },
  tabContent: {
    padding: theme.spacing(2),
    textAlign: "left"
  }
}));

export default function ProjectPage({ project, members }) {
  return (
    <WideLayout title={project ? project.name : "Project not found"}>
      {project ? (
        <ProjectLayout project={{ ...project, team: members }} />
      ) : (
        <NoProjectFoundLayout />
      )}
    </WideLayout>
  );
}

ProjectPage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    project: await getProjectByIdIfExists(ctx.query.projectId, token),
    members: token ? await getProjectMembersByIdIfExists(ctx.query.projectId, token) : []
  };
};

function ProjectLayout({ project }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className={classes.root}>
      <ProjectOverview project={project} smallScreen={isNarrowScreen} />

      <Container className={classes.noPadding}>
        <div className={classes.tabsWrapper}>
          <Tabs
            variant={isNarrowScreen ? "fullWidth" : "standard"}
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
          >
            <Tab label="Project" />
            <Tab label="Team" />
            <Tab label="Discussion" />
          </Tabs>
        </div>
      </Container>

      <Container className={classes.tabContent}>
        <TabContent value={tabValue} index={0}>
          <ProjectContent project={project} />
        </TabContent>
        <TabContent value={tabValue} index={1}>
          <ProjectTeamContent team={project.team} />
        </TabContent>
        <TabContent value={tabValue} index={2}>
          <ProjectCommentsContent comments={project.comments} />
        </TabContent>
      </Container>
    </div>
  );
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}

function NoProjectFoundLayout() {
  return (
    <>
      <p>Project not found.</p>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </>
  );
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProjectByIdIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/projects/" + projectUrl + "/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      //TODO: get comments and timeline posts and project taggings
      return parseProject(resp.data);
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getProjectMembersByIdIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/projects/" + projectUrl + "/members/",
      tokenConfig(token)
    );
    if (resp.data.results.length === 0) return null;
    else {
      //TODO: get comments and timeline posts and project taggings
      return parseProjectMembers(resp.data.results);
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseProject(project) {
  return {
    name: project.name,
    id: project.id,
    url_slug: project.url_slug,
    image: project.image,
    status: project.status,
    location: project.city + " " + project.country,
    description: project.description,
    shortdescription: project.short_description,
    collaborators_welcome: project.collaborators_welcome,
    start_date: project.start_date,
    end_date: project.end_date,
    creation_date: project.created_at,
    helpful_skills: project.skills,
    helpful_connections: project.helpful_connections,
    creator: project.project_parents[0].parent_organization
      ? project.project_parents[0].parent_organization
      : project.project_parents[0].parent_user,
    tags: project.tags.map(t => t.project_tag.name),
    timeline_posts: project.project_posts,
    //TODO: remove after comments are added
    comments: project.comments
  };
}

function parseProjectMembers(projectMembers) {
  return projectMembers.map(m => {
    return {
      url_slug: m.url_slug,
      role: m.role_in_project,
      permissions: m.role.name,
      timeperweek: m.time_per_week,
      name: m.user.first_name + " " + m.user.last_name,
      image: m.user.image
    };
  });
}
