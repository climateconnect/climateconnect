import { Container, Tab, Tabs, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import axios from "axios";
import Cookies from "next-cookies";
import React, { useContext, useEffect, useRef } from "react";
import tokenConfig from "../../public/config/tokenConfig";
import { redirect } from "../../public/lib/apiOperations";
import UserContext from "../../src/components/context/UserContext";
import ConfirmDialog from "../../src/components/dialogs/ConfirmDialog";
import PageNotFound from "../../src/components/general/PageNotFound";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectCommentsContent from "../../src/components/project/ProjectCommentsContent";
import ProjectContent from "../../src/components/project/ProjectContent";
import ProjectOverview from "../../src/components/project/ProjectOverview";
import ProjectTeamContent from "../../src/components/project/ProjectTeamContent";
import Tutorial from "../../src/components/tutorial/Tutorial";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    color: theme.palette.grey[800],
  },
  tabsWrapper: {
    borderBottom: `1px solid ${theme.palette.grey[500]}`,
  },
  noPadding: {
    padding: 0,
  },
  tabContent: {
    padding: theme.spacing(2),
    textAlign: "left",
  },
  dialogText: {
    textAlign: "center",
    margin: "0 auto",
    display: "block",
  },
  tab: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: 145,
  },
}));

const parseComments = (comments) => {
  return comments
    .filter((c) => {
      return !c.parent_comment_id;
    })
    .map((c) => {
      return {
        ...c,
        replies: comments
          .filter((r) => r.parent_comment_id === c.id)
          .sort((a, b) => {
            return new Date(a.created_at) - new Date(b.created_at);
          }),
      };
    });
};

export default function ProjectPage({ project, members, posts, comments, token, following }) {
  const [curComments, setCurComments] = React.useState(parseComments(comments));
  const [message, setMessage] = React.useState({});
  const [isUserFollowing, setIsUserFollowing] = React.useState(following);
  const [followingChangePending, setFollowingChangePending] = React.useState(false);
  const { user } = useContext(UserContext);

  const handleWindowClose = (e) => {
    if (curComments.filter((c) => c.unconfirmed).length > 0 || followingChangePending) {
      e.preventDefault();
      return (e.returnValue = "Changes you made might not be saved.");
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  });

  return (
    <WideLayout
      description={project?.shortdescription}
      message={message?.message}
      messageType={message?.messageType}
      title={project ? project.name : "Solution Not Found"}
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
          followingChangePending={followingChangePending}
          setFollowingChangePending={setFollowingChangePending}
        />
      ) : (
        <PageNotFound itemName="Project" />
      )}
    </WideLayout>
  );
}

ProjectPage.getInitialProps = async (ctx) => {
  const { token } = Cookies(ctx);
  const projectUrl = encodeURI(ctx.query.projectId);
  const [project, members, posts, comments, following] = await Promise.all([
    getProjectByIdIfExists(projectUrl, token),
    token ? getProjectMembersByIdIfExists(projectUrl, token) : [],
    getPostsByProject(projectUrl, token),
    getCommentsByProject(projectUrl, token),
    token ? getIsUserFollowing(projectUrl, token) : false,
  ]);
  return {
    project: project,
    members: members,
    posts: posts,
    comments: comments,
    token: token,
    following: following,
  };
};

function ProjectLayout({
  project,
  token,
  setMessage,
  isUserFollowing,
  setIsUserFollowing,
  user,
  setCurComments,
  followingChangePending,
  setFollowingChangePending,
}) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [hash, setHash] = React.useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState({ follow: false, leave: false });
  const typesByTabValue = ["project", "team", "comments"];

  //refs for tutorial
  const projectDescriptionRef = useRef(null);
  const collaborationSectionRef = useRef(null);
  const contactProjectCreatorButtonRef = useRef(null);
  const projectTabsRef = useRef(null);

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
      } else if (project?.team?.length < 10 && project.comments.length > 0) {
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

  const onFollowDialogClose = (confirmed) => {
    if (confirmed) toggleFollowProject();
    setConfirmDialogOpen({ ...confirmDialogOpen, follow: false });
  };

  const leaveProject = async () => {
    try {
      console.log(tokenConfig(token));
      const resp = await axios.post(
        process.env.API_URL + "/api/projects/" + project.url_slug + "/leave/",
        {},
        tokenConfig(token)
      );
      console.log(resp);
      if (resp.status === 200)
        setMessage({
          message: <span>You have successfully left the project.</span>,
          messageType: "success",
        });
      redirect(`/projects/${project.url_slug}`, {
        message: "You have successfully left the project.",
      });
    } catch (e) {
      console.log(e?.response?.data?.message);
      setMessage({
        message: <span>{e?.response?.data?.message}</span>,
        messageType: "error",
      });
    }
  };

  const onConfirmDialogClose = async (confirmed) => {
    if (confirmed) await leaveProject();
    setConfirmDialogOpen({ ...confirmDialogOpen, leave: false });
  };

  const handleToggleFollowProject = () => {
    if (!token)
      setMessage({
        message: (
          <span>
            Please <a href="/signin">log in</a> to follow a project.
          </span>
        ),
        messageType: "error",
      });
    else if (isUserFollowing) setConfirmDialogOpen({ ...confirmDialogOpen, follow: true });
    else toggleFollowProject();
  };

  const toggleFollowProject = () => {
    const new_value = !isUserFollowing;
    setIsUserFollowing(new_value);
    setFollowingChangePending(true);
    axios
      .post(
        process.env.API_URL + "/api/projects/" + project.url_slug + "/set_follow/",
        { following: new_value },
        tokenConfig(token)
      )
      .then(function (response) {
        setIsUserFollowing(response.data.following);
        setFollowingChangePending(false);
        setMessage({
          message: response.data.message,
          messageType: "success",
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error && error.reponse) console.log(error.response);
      });
  };

  const requestLeaveProject = () => {
    const user_permission =
      user && project.team && project.team.find((m) => m.id === user.id)
        ? project.team.find((m) => m.id === user.id).permission
        : null;
    const team_size = project?.team?.length;
    if (user_permission === "Creator" && team_size > 1)
      setMessage({
        message:
          'You can\'t leave a project as the creator. Please give the creator role to another team member by clicking "Manage Members" in the team tab',
        messageType: "error",
      });
    else setConfirmDialogOpen({ ...confirmDialogOpen, leave: true });
  };

  return (
    <div className={classes.root}>
      <ProjectOverview
        project={project}
        smallScreen={isNarrowScreen}
        handleToggleFollowProject={handleToggleFollowProject}
        isUserFollowing={isUserFollowing}
        followingChangePending={followingChangePending}
        contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
      />

      <Container className={classes.noPadding}>
        <div className={classes.tabsWrapper} ref={projectTabsRef}>
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
          <ProjectContent
            project={project}
            leaveProject={requestLeaveProject}
            projectDescriptionRef={projectDescriptionRef}
            collaborationSectionRef={collaborationSectionRef}
          />
        </TabContent>
        <TabContent value={tabValue} index={1}>
          <ProjectTeamContent project={project} leaveProject={requestLeaveProject} />
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
        open={confirmDialogOpen.follow}
        onClose={onFollowDialogClose}
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
      <ConfirmDialog
        open={confirmDialogOpen.leave}
        onClose={onConfirmDialogClose}
        title="Do you really want to leave this project?"
        text={
          <span className={classes.dialogText}>
            Are you sure that you want to leave this project?
            <br />
            You {"won't"} be part of the team anymore.
            {project?.team?.length === 1 && (
              <Typography color="error">
                <b>
                  Danger: You are the only member of this project. <br /> If you leave the project
                  it will be deactivated.
                </b>
              </Typography>
            )}
          </span>
        }
        confirmText="Yes"
        cancelText="No"
      />
      <Tutorial
        fixedPosition
        pointerRefs={{
          projectDescriptionRef: projectDescriptionRef,
          collaborationSectionRef: collaborationSectionRef,
          contactProjectCreatorButtonRef: contactProjectCreatorButtonRef,
          projectTabsRef: projectTabsRef,
        }}
      />
    </div>
  );
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}

async function getProjectByIdIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
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
    location: project.location,
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
    tags: project.tags.map((t) => t.project_tag.name),
    collaborating_organizations: project.collaborating_organizations.map(
      (o) => o.collaborating_organization
    ),
    website: project.website,
    number_of_followers: project.number_of_followers,
  };
}

function parseProjectMembers(projectMembers) {
  return projectMembers.map((m) => {
    return {
      ...m.user,
      url_slug: m.user.url_slug,
      role: m.role_in_project,
      permission: m.role.name,
      availability: m.availability,
      name: m.user.first_name + " " + m.user.last_name,
      location: m.user.location,
    };
  });
}
