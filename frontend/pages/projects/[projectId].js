import React, { useEffect, useContext } from "react";
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
import { getParams } from "./../../public/lib/generalOperations";

import tokenConfig from "../../public/config/tokenConfig";
import axios from "axios";
import ConfirmDialog from "../../src/components/dialogs/ConfirmDialog";
import UserContext from "../../src/components/context/UserContext";

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
  },
  dialogText: {
    textAlign: "center",
    margin: "0 auto",
    display: "block"
  },
  tab: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: 145
  }
}));

const parseComments = comments => {
  return comments
    .filter(c => {
      return !c.parent_comment_id;
    })
    .map(c => {
      return {
        ...c,
        replies: comments
          .filter(r => r.parent_comment_id === c.id)
          .sort((a, b) => {
            return new Date(a.created_at) - new Date(b.created_at);
          })
      };
    });
};

export default function ProjectPage({ project, members, posts, comments, token, following }) {
  const [curComments, setCurComments] = React.useState(parseComments(comments));
  const [message, setMessage] = React.useState({});
  const [isUserFollowing, setIsUserFollowing] = React.useState(following);
  const { user } = useContext(UserContext);
  useEffect(() => {
    const params = getParams(window.location.href);
    if (params.message && encodeURI(message.message) != params.message) {
      setMessage({ message: decodeURI(params.message) });
    }
  });
  return (
    <WideLayout
      message={message.message}
      messageType={message.messageType}
      title={project ? project.name : "Project not found"}
    >
      {project ? (
        <ProjectLayout
          project={{ ...project, team: members, timeline_posts: posts, comments: curComments }}
          token={token}
          setMessage={setMessage}
          isUserFollowing={isUserFollowing}
          setIsUserFollowing={setIsUserFollowing}
          user={user}
          setCurComments={setCurComments}
        />
      ) : (
        <NoProjectFoundLayout />
      )}
    </WideLayout>
  );
}

ProjectPage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const projectUrl = encodeURI(ctx.query.projectId);
  return {
    project: await getProjectByIdIfExists(projectUrl, token),
    members: token ? await getProjectMembersByIdIfExists(projectUrl, token) : [],
    posts: await getPostsByProject(projectUrl, token),
    comments: await getCommentsByProject(projectUrl, token),
    token: token,
    following: await getIsUserFollowing(projectUrl, token)
  };
};

function ProjectLayout({
  project,
  token,
  setMessage,
  isUserFollowing,
  setIsUserFollowing,
  user,
  setCurComments
}) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  const [hash, setHash] = React.useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const typesByTabValue = ["project", "team", "comments"];

  useEffect(() => {
    if (window.location.hash) {
      setHash(window.location.hash.replace("#", ""));
      setTabValue(typesByTabValue.indexOf(window.location.hash.replace("#", "")));
    }
  });

  const [tabValue, setTabValue] = React.useState(hash ? typesByTabValue.indexOf(hash) : 0);

  // pagination will only return 12 members
  const teamTabLabel = () => {
    let teamLabel = "Team";
    if (project && project.team) {
      if (project.team.length === 12) {
        teamLabel += ` (${project.team.length}+)`;
      } else if (project.team.length < 12 && project.team.length > 0) {
        teamLabel += ` (${project.team.length})`;
      }
    }
    return teamLabel;
  };

  // pagination will only return 10 comments
  const commentsTabLabel = () => {
    let commentsLabel = "Comments";
    if (project && project.comments) {
      if (project.comments.length === 10) {
        commentsLabel += ` (${project.comments.length}+)`;
      } else if (project.team.length < 10 && project.comments.length > 0) {
        commentsLabel += ` (${project.comments.length})`;
      }
    }
    return commentsLabel;
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) window.location.hash = "";
    else window.location.hash = typesByTabValue[newValue];
    setTabValue(newValue);
  };

  const onConfirmDialogClose = confirmed => {
    if (confirmed) toggleFollowProject();
    setConfirmDialogOpen(false);
  };

  const handleToggleFollowProject = () => {
    if (!token)
      setMessage({
        message: (
          <span>
            Please <a href="/signin">log in</a> to follow a project.
          </span>
        ),
        messageType: "error"
      });
    else if (isUserFollowing) setConfirmDialogOpen(true);
    else toggleFollowProject();
  };

  const toggleFollowProject = () => {
    axios
      .post(
        process.env.API_URL + "/api/projects/" + project.url_slug + "/set_follow/",
        { following: !isUserFollowing },
        tokenConfig(token)
      )
      .then(function(response) {
        setIsUserFollowing(response.data.following);
        setMessage({
          message: response.data.message,
          messageType: "success"
        });
      })
      .catch(function(error) {
        console.log(error);
        if (error && error.reponse) console.log(error.response);
      });
  };

  return (
    <div className={classes.root}>
      <ProjectOverview
        project={project}
        smallScreen={isNarrowScreen}
        handleToggleFollowProject={handleToggleFollowProject}
        isUserFollowing={isUserFollowing}
      />

      <Container className={classes.noPadding}>
        <div className={classes.tabsWrapper}>
          <Tabs
            variant={isNarrowScreen ? "fullWidth" : "standard"}
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
          >
            <Tab label="Project" className={classes.tab} />
            <Tab label={teamTabLabel()} className={classes.tab} />
            <Tab label={commentsTabLabel()} className={classes.tab} />
          </Tabs>
        </div>
      </Container>

      <Container className={classes.tabContent}>
        <TabContent value={tabValue} index={0}>
          <ProjectContent project={project} />
        </TabContent>
        <TabContent value={tabValue} index={1}>
          <ProjectTeamContent project={project} />
        </TabContent>
        <TabContent value={tabValue} index={2}>
          <ProjectCommentsContent
            project={project}
            user={user}
            token={token}
            setCurComments={setCurComments}
          />
        </TabContent>
      </Container>
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={onConfirmDialogClose}
        title="Do you really want to unfollow?"
        text={
          <span className={classes.dialogText}>
            Are you sure that you want to unfollow this project?
            <br />
            You {"won't"} receive updates about it anymore
          </span>
        }
        confirmText="Yes"
        cancelText="No"
      />
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

async function getProjectByIdIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/",
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

async function getIsUserFollowing(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/am_i_following/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      //TODO: get comments and timeline posts and project taggings
      return resp.data.is_following;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getPostsByProject(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/posts/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getCommentsByProject(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/comments/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getProjectMembersByIdIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/members/",
      tokenConfig(token)
    );
    if (resp.data.results.length === 0) return null;
    else {
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
    location: project.city + ", " + project.country,
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
    isPersonalProject: !project.project_parents[0].parent_organization,
    is_draft: project.is_draft,
    tags: project.tags.map(t => t.project_tag.name),
    collaborating_organizations: project.collaborating_organizations.map(
      o => o.collaborating_organization
    ),
    website: project.website,
    number_of_followers: project.number_of_followers
  };
}

function parseProjectMembers(projectMembers) {
  return projectMembers.map(m => {
    return {
      ...m.user,
      url_slug: m.user.url_slug,
      role: m.role_in_project,
      permission: m.role.name,
      availability: m.availability,
      name: m.user.first_name + " " + m.user.last_name,
      location: m.user.city ? m.user.city + ", " + m.user.country : m.user.country
    };
  });
}
