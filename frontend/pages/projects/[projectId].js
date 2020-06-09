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

import TEMP_FEATURED_DATA from "../../public/data/projects.json";
import TEMP_FEATURED_PROFILE_DATA from "../../public/data/profiles.json";
import TEMP_FEATURED_ORGANIZATION_DATA from "../../public/data/organizations.json";
import tokenConfig from '../../public/config/tokenConfig';
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

export default function ProjectPage({ project }) {
  return (
    <WideLayout title={project ? project.name : "Project not found"}>
      {project ? <ProjectLayout project={project} /> : <NoProjectFoundLayout />}
    </WideLayout>
  );
}

ProjectPage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    project: await getProjectByIdIfExists(ctx.query.projectId, token)
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

const sortByDate = (a, b) => {
  return new Date(b.date) - new Date(a.date);
};

//these are really ugly functions but it doesn't matter since they will be replaced by db calls
// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProjectByIdIfExists(projectUrl, token) {
  try {
    console.log(process.env.API_URL + "/projects/?search=" + projectUrl);
    const resp = await axios.get(
      process.env.API_URL + "/projects/?search=" + projectUrl,
      tokenConfig(token)
    );
    console.log('made a request!')
    console.log(resp.data.results)
    if (resp.data.results.length === 0) return null;
    else {
      //console.log(resp.data.results[0]);
      return parseProject(resp.data.results[0]);
    }
  } catch (err) {
    //console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
  const project = { ...TEMP_FEATURED_DATA.projects.find(({ id }) => id === projectId) };
  project.team = await getFullProfiles(project.team);
  project.timeline_posts = await Promise.all(
    project.timeline_posts.sort(sortByDate).map(async post => {
      return {
        ...post,
        creator: await getProfileOfPostCreator(post),
        comments: await Promise.all(
          post.replies.sort(sortByDate).map(async reply => {
            const ret = reply;
            ret.creator = await getProfileOfPostCreator(reply);
            return ret;
          })
        )
      };
    })
  );
  project.comments = await Promise.all(
    project.comments.sort(sortByDate).map(async comment => {
      return {
        ...comment,
        creator: await getProfileOfPostCreator(comment),
        replies: await Promise.all(
          comment.replies.sort(sortByDate).map(async reply => {
            const ret = reply;
            ret.creator = await getProfileOfPostCreator(reply);
            return ret;
          })
        )
      };
    })
  );
  return { ...project };
}

function parseProject(project) {
  console.log(project)
  return null
}

async function getFullProfiles(shortProfiles) {
  const profiles = [
    ...TEMP_FEATURED_PROFILE_DATA.profiles.filter(
      profile =>
        shortProfiles.filter(shortprofile => shortprofile.url_slug === profile.url_slug).length ===
        1
    )
  ];
  return profiles.map(profile => {
    return {
      ...profile,
      ...shortProfiles.filter(shortprofile => shortprofile.url_slug === profile.url_slug)[0]
    };
  });
}

async function getProfileOfPostCreator(post) {
  if (post.creator.type === "organization") {
    const profile = {
      ...TEMP_FEATURED_ORGANIZATION_DATA.organizations.find(
        o => o.url_slug === post.creator.url_slug.replace("/organizations/", "")
      )
    };
    return { ...profile, url: "/organizations/" + profile.url_slug, type: "organization" };
  } else if (post.creator.type === "profile") {
    const profile = {
      ...TEMP_FEATURED_PROFILE_DATA.profiles.find(
        p => p.url_slug === post.creator.url_slug.replace("/profiles/", "")
      )
    };
    return { ...profile, url: "/profiles/" + profile.url_slug, type: "profile" };
  } else {
    throw new Error(
      "Unaccepted input for 'creator.type':'" +
        post.creator.type +
        "' for creator '" +
        post.creator.url +
        "' on post '" +
        post.content +
        "'. creator.type must be 'organization' or 'project'"
    );
  }
}
