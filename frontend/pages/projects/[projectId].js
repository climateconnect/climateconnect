import { AppBar, Button, Container, Tab, Tabs, Toolbar, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useRef } from "react";
import { apiRequest, redirect } from "../../public/lib/apiOperations";
import BottomOfPageAboveFooter from "../../src/components/hooks/BottomOfPageAboveFooter";
import { CircularProgress } from "@material-ui/core";
import ConfirmDialog from "../../src/components/dialogs/ConfirmDialog";
import ContactCreatorButton from "../../src/components/project/ContactCreatorButton";
import Cookies from "universal-cookie";
import ElementOnScreen from "../../src/components/hooks/ElementOnScreen";
import ElementSpaceToRight from "../../src/components/hooks/ElementSpaceToRight";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { IconButton } from "@material-ui/core";
import { Link } from "@material-ui/core";
import NextCookies from "next-cookies";
import PageNotFound from "../../src/components/general/PageNotFound";
import ProjectCommentsContent from "../../src/components/project/ProjectCommentsContent";
import ProjectContent from "../../src/components/project/ProjectContent";
import ProjectOverview from "../../src/components/project/ProjectOverview";
import ProjectTeamContent from "../../src/components/project/ProjectTeamContent";
import ROLE_TYPES from "../../public/data/role_types";
import Router from "next/router";
import Tutorial from "../../src/components/tutorial/Tutorial";
import UserContext from "../../src/components/context/UserContext";
import WideLayout from "../../src/components/layouts/WideLayout";
import { getParams } from "../../public/lib/generalOperations";
import getTexts from "../../public/texts/texts";
import { makeStyles } from "@material-ui/core/styles";
import { nullifyUndefinedValues } from "../../public/lib/profileOperations";
import { startPrivateChat } from "../../public/lib/messagingOperations";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    color: theme.palette.grey[800],
    position: "relative",
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
  largeScreenButton: (props) => ({
    position: "fixed",
    bottom: props.bottomInteractionFooter + 2,
    right: props.containerSpaceToRight,
    boxShadow: "3px -3px 6px #00000029",
  }),
  bottomActionBar: (props) => ({
    backgroundColor: "#ECECEC",
    top: "auto",
    bottom: props.bottomInteractionFooter,
    boxShadow: "-3px -3px 6px #00000029",
  }),
  containerButtonsActionBar: {
    display: "flex",
    justifyContent: "space-around",
  },
  smallAvatar: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  followButtonContainer: (props) => ({
    display: "inline-flex",
    flexDirection: props.hasAdminPermissions ? "auto" : "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  }),
  followersLink: (props) => ({
    cursor: "pointer",
    textDecoration: "none",
    marginLeft: props.hasAdminPermissions ? theme.spacing(1) : 0,
  }),
  followerNumber: {
    fontWeight: 700,
    color: theme.palette.secondary.main,
  },
  followersText: {
    fontWeight: 500,
    fontSize: 18,
    color: theme.palette.secondary.light,
  },
  followingButton: {
    whiteSpace: "nowrap",
    marginLeft: theme.spacing(0.5),
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

export async function getServerSideProps(ctx) {
  const { token } = NextCookies(ctx);
  const projectUrl = encodeURI(ctx.query.projectId);
  const [project, members, posts, comments, following] = await Promise.all([
    getProjectByIdIfExists(projectUrl, token, ctx.locale),
    token ? getProjectMembersByIdIfExists(projectUrl, token, ctx.locale) : [],
    getPostsByProject(projectUrl, token, ctx.locale),
    getCommentsByProject(projectUrl, token, ctx.locale),
    token ? getIsUserFollowing(projectUrl, token, ctx.locale) : false,
  ]);
  return {
    props: nullifyUndefinedValues({
      project: project,
      members: members,
      posts: posts,
      comments: comments,
      following: following,
    }),
  };
}

export default function ProjectPage({ project, members, posts, comments, following }) {
  const token = new Cookies().get("token");
  const [curComments, setCurComments] = React.useState(parseComments(comments));
  const [message, setMessage] = React.useState({});
  const [isUserFollowing, setIsUserFollowing] = React.useState(following);
  const [followingChangePending, setFollowingChangePending] = React.useState(false);
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });

  const handleWindowClose = (e) => {
    if (curComments.filter((c) => c.unconfirmed).length > 0 || followingChangePending) {
      e.preventDefault();
      return (e.returnValue = texts.changes_might_not_be_saved);
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
      description={project?.short_description}
      message={message?.message}
      messageType={message?.messageType}
      title={project ? project.name : texts.project + " " + texts.not_found}
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
          texts={texts}
          projectAdmin={members.find((m) => m.permission === ROLE_TYPES.all_type)}
        />
      ) : (
        <PageNotFound itemName={texts.project} />
      )}
    </WideLayout>
  );
}

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
  texts,
  projectAdmin,
}) {
  const bottomInteractionFooter = BottomOfPageAboveFooter();
  const tabContentRef = useRef(null);
  const containerSpaceToRight = ElementSpaceToRight({ el: tabContentRef.current });

  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTinyScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const [hash, setHash] = React.useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState({ follow: false, leave: false });
  const typesByTabValue = ["project", "team", "comments"];

  //refs for tutorial
  const projectDescriptionRef = useRef(null);
  const collaborationSectionRef = useRef(null);
  const contactProjectCreatorButtonRef = useRef(null);
  const projectTabsRef = useRef(null);

  const messageButtonIsVisible = ElementOnScreen({ el: contactProjectCreatorButtonRef.current });

  const handleClickContact = async (event) => {
    event.preventDefault();

    const creator = project.team.filter((m) => m.permission === ROLE_TYPES.all_type)[0];
    if (!user) {
      return redirect("/signin", {
        redirect: window.location.pathname + window.location.search,
        errorMessage: texts.please_create_an_account_or_log_in_to_contact_a_projects_organizer,
      });
    }
    const chat = await startPrivateChat(creator, token, locale);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  const { notifications, setNotificationsRead, refreshNotifications } = useContext(UserContext);
  const user_permission =
    user && project.team && project.team.find((m) => m.id === user.id)
      ? project.team.find((m) => m.id === user.id).permission
      : null;
  const hasAdminPermissions =
    user_permission && [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(user_permission);

  useEffect(() => {
    if (window.location.hash) {
      setHash(window.location.hash.replace("#", ""));
      setTabValue(typesByTabValue.indexOf(window.location.hash.replace("#", "")));
    }
  });

  const [tabValue, setTabValue] = React.useState(hash ? typesByTabValue.indexOf(hash) : 0);

  // pagination will only return 12 members
  const teamTabLabel = () => {
    let teamLabel = texts.team;
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
  const discussionTabLabel = () => {
    let discussionLabel = texts.discussion;
    const number_of_parent_comments = project.comments.length;
    const number_of_replies = project.comments.reduce((total, p) => total + p?.replies?.length, 0);
    const number_of_coments = number_of_parent_comments + number_of_replies;
    if (project && project.comments) {
      if (project.comments.length === 10) {
        discussionLabel += ` (${number_of_coments}+)`;
      } else if (project?.team?.length < 10 && number_of_coments > 0) {
        discussionLabel += ` (${number_of_coments})`;
      }
    }
    return discussionLabel;
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
      const resp = await apiRequest({
        method: "post",
        url: "/api/projects/" + project.url_slug + "/leave/",
        payload: {},
        token: token,
        locale: locale,
      });
      console.log(resp);
      if (resp.status === 200)
        setMessage({
          message: <span>{texts.you_have_successfully_left_the_project}</span>,
          messageType: "success",
        });
      redirect(`/projects/${project.url_slug}`, {
        message: texts.you_have_successfully_left_the_project,
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
        message: <span>{texts.please_log_in_to_follow_a_project}</span>,
        messageType: "error",
      });
    else if (isUserFollowing) setConfirmDialogOpen({ ...confirmDialogOpen, follow: true });
    else toggleFollowProject();
  };

  const toggleFollowProject = () => {
    const new_value = !isUserFollowing;
    setIsUserFollowing(new_value);
    setFollowingChangePending(true);
    apiRequest({
      method: "post",
      url: "/api/projects/" + project.url_slug + "/set_follow/",
      payload: { following: new_value },
      token: token,
      locale: locale,
    })
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
    if (user_permission === ROLE_TYPES.all_type && team_size > 1)
      setMessage({
        message: `You can't leave a project as the creator. Please give the creator role to another team member by clicking "Manage Members" in the team tab`,
        messageType: "error",
      });
    else setConfirmDialogOpen({ ...confirmDialogOpen, leave: true });
  };

  const [initiallyCaughtFollowers, setInitiallyCaughtFollowers] = React.useState(false);
  const [followers, setFollowers] = React.useState([]);
  const [showFollowers, setShowFollowers] = React.useState(false);
  const toggleShowFollowers = async () => {
    setShowFollowers(!showFollowers);
    if (!initiallyCaughtFollowers) {
      const retrievedFollowers = await getFollowers(project, token, locale);
      const notification_to_set_read = notifications.filter(
        (n) => n.notification_type === 4 && n.project.url_slug === project.url_slug
      );
      await setNotificationsRead(token, notification_to_set_read, locale);
      await refreshNotifications();
      setFollowers(retrievedFollowers);
      setInitiallyCaughtFollowers(true);
    }
  };
  const [gotParams, setGotParams] = React.useState(false);
  useEffect(() => {
    if (!gotParams) {
      const params = getParams(window.location.href);
      if (params.show_followers && !showFollowers) toggleShowFollowers();
      setGotParams(true);
    }
  });

  return (
    <div className={classes.root}>
      <ProjectOverview
        project={project}
        smallScreen={isNarrowScreen}
        handleToggleFollowProject={handleToggleFollowProject}
        isUserFollowing={isUserFollowing}
        followingChangePending={followingChangePending}
        contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
        projectAdmin={projectAdmin}
        handleClickContact={handleClickContact}
        hasAdminPermissions={hasAdminPermissions}
        FollowButton={FollowButton}
        toggleShowFollowers={toggleShowFollowers}
        user={user}
        followers={followers}
        locale={locale}
        showFollowers={showFollowers}
        initiallyCaughtFollowers={initiallyCaughtFollowers}
      />

      <Container className={classes.noPadding}>
        <div className={classes.tabsWrapper} ref={projectTabsRef}>
          <Tabs
            variant={isNarrowScreen ? "fullWidth" : "standard"}
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
          >
            <Tab label={texts.project} className={classes.tab} />
            <Tab label={teamTabLabel()} className={classes.tab} />
            <Tab label={discussionTabLabel()} className={classes.tab} />
          </Tabs>
        </div>
      </Container>

      <Container className={classes.tabContent} ref={tabContentRef}>
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
      <Container>
        {isTinyScreen ? (
          <TinyScreenInteractionFooter
            project={project}
            projectAdmin={projectAdmin}
            handleClickContact={handleClickContact}
            hasAdminPermissions={hasAdminPermissions}
            texts={texts}
            bottomInteractionFooter={bottomInteractionFooter}
            tinyScreen={isTinyScreen}
            isUserFollowing={isUserFollowing}
            handleToggleFollowProject={handleToggleFollowProject}
            toggleShowFollowers={toggleShowFollowers}
            FollowButton={FollowButton}
            followingChangePending={followingChangePending}
          />
        ) : isNarrowScreen ? (
          <SmallScreenInteractionFooter
            project={project}
            projectAdmin={projectAdmin}
            handleClickContact={handleClickContact}
            hasAdminPermissions={hasAdminPermissions}
            texts={texts}
            bottomInteractionFooter={bottomInteractionFooter}
            smallScreen={isNarrowScreen}
            isUserFollowing={isUserFollowing}
            handleToggleFollowProject={handleToggleFollowProject}
            toggleShowFollowers={toggleShowFollowers}
            FollowButton={FollowButton}
            followingChangePending={followingChangePending}
          />
        ) : (
          <LargeScreenInteractionFooter
            projectAdmin={projectAdmin}
            handleClickContact={handleClickContact}
            hasAdminPermissions={hasAdminPermissions}
            messageButtonIsVisible={messageButtonIsVisible}
            contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
            bottomInteractionFooter={bottomInteractionFooter}
            containerSpaceToRight={containerSpaceToRight}
          />
        )}
      </Container>
      <ConfirmDialog
        open={confirmDialogOpen.follow}
        onClose={onFollowDialogClose}
        title={texts.do_you_really_want_to_unfollow}
        text={
          <span className={classes.dialogText}>
            {texts.are_you_sure_that_you_want_to_unfollow_this_project}
          </span>
        }
        confirmText="Yes"
        cancelText="No"
      />
      <ConfirmDialog
        open={confirmDialogOpen.leave}
        onClose={onConfirmDialogClose}
        title={texts.do_you_really_want_to_leave_this_project}
        text={
          <span className={classes.dialogText}>
            {texts.are_you_sure_that_you_want_to_leave_this_project}
            <br />
            {texts.you_wont_be_part_of_the_team_anymore}
            {project?.team?.length === 1 && (
              <Typography color="error">
                <b>{texts.you_are_the_only_member_of_this_project}</b>
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

function LargeScreenInteractionFooter({
  projectAdmin,
  handleClickContact,
  hasAdminPermissions,
  messageButtonIsVisible,
  contactProjectCreatorButtonRef,
  bottomInteractionFooter,
  containerSpaceToRight,
}) {
  const classes = useStyles({
    bottomInteractionFooter: bottomInteractionFooter,
    containerSpaceToRight: containerSpaceToRight,
  });
  return (
    <Container className={classes.largeScreenButtonContainer}>
      {!hasAdminPermissions &&
        !messageButtonIsVisible &&
        contactProjectCreatorButtonRef?.current && (
          <ContactCreatorButton
            className={classes.largeScreenButton}
            projectAdmin={projectAdmin}
            handleClickContact={handleClickContact}
          />
        )}
    </Container>
  );
}

function SmallScreenInteractionFooter({
  project,
  projectAdmin,
  handleClickContact,
  hasAdminPermissions,
  bottomInteractionFooter,
  smallScreen,
  isUserFollowing,
  handleToggleFollowProject,
  toggleShowFollowers,
  FollowButton,
  followingChangePending,
  texts,
}) {
  const classes = useStyles({ bottomInteractionFooter: bottomInteractionFooter });
  return (
    <AppBar className={classes.bottomActionBar} position="fixed" elevation={0}>
      <Toolbar className={classes.containerButtonsActionBar} variant="dense">
        {!hasAdminPermissions && (
          <ContactCreatorButton
            projectAdmin={projectAdmin}
            handleClickContact={handleClickContact}
            smallScreen={smallScreen}
          />
        )}
        <FollowButton
          isUserFollowing={isUserFollowing}
          handleToggleFollowProject={handleToggleFollowProject}
          project={project}
          hasAdminPermissions={hasAdminPermissions}
          toggleShowFollowers={toggleShowFollowers}
          followingChangePending={followingChangePending}
          texts={texts}
          smallScreen={smallScreen}
        />
        <IconButton size="small">
          <FavoriteIcon fontSize="large" color="primary" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

function TinyScreenInteractionFooter({
  project,
  projectAdmin,
  handleClickContact,
  hasAdminPermissions,
  bottomInteractionFooter,
  tinyScreen,
  isUserFollowing,
  handleToggleFollowProject,
  toggleShowFollowers,
  FollowButton,
  followingChangePending,
  texts,
}) {
  const classes = useStyles({ bottomInteractionFooter: bottomInteractionFooter });
  return (
    <AppBar className={classes.bottomActionBar} position="fixed" elevation={0}>
      <Toolbar className={classes.containerButtonsActionBar} variant="dense">
        {!hasAdminPermissions && (
          <ContactCreatorButton
            projectAdmin={projectAdmin}
            handleClickContact={handleClickContact}
            tinyScreen={tinyScreen}
          />
        )}
        <FollowButton
          isUserFollowing={isUserFollowing}
          handleToggleFollowProject={handleToggleFollowProject}
          project={project}
          hasAdminPermissions={hasAdminPermissions}
          toggleShowFollowers={toggleShowFollowers}
          followingChangePending={followingChangePending}
          texts={texts}
          tinyScreen={tinyScreen}
        />
        <IconButton size="small">
          <FavoriteIcon fontSize="large" color="primary" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}

function FollowButton({
  project,
  isUserFollowing,
  handleToggleFollowProject,
  hasAdminPermissions,
  toggleShowFollowers,
  followingChangePending,
  texts,
  smallScreen,
  tinyScreen,
}) {
  const classes = useStyles({ hasAdminPermissions: hasAdminPermissions });
  if (!(smallScreen || tinyScreen)) {
    return (
      <span className={classes.followButtonContainer}>
        <Button
          onClick={handleToggleFollowProject}
          variant="contained"
          color={isUserFollowing ? "secondary" : "primary"}
          disabled={followingChangePending}
          className={classes.followingButton}
        >
          {followingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
          {isUserFollowing ? texts.following : texts.follow}
        </Button>
        {project.number_of_followers > 0 && (
          <Link
            color="secondary"
            underline="always"
            className={classes.followersLink}
            onClick={toggleShowFollowers}
          >
            <Typography className={classes.followersText}>
              <span className={classes.followerNumber}>{project.number_of_followers} </span>
              {project.number_of_followers > 1 ? texts.followers : texts.follower}
            </Typography>
          </Link>
        )}
      </span>
    );
  } else {
    return (
      <Button
        onClick={handleToggleFollowProject}
        variant="contained"
        color={isUserFollowing ? "secondary" : "primary"}
        disabled={followingChangePending}
        className={classes.followingButton}
      >
        {followingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
        {isUserFollowing ? texts.following : texts.follow}
      </Button>
    );
  }
}

const getFollowers = async (project, token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + project.url_slug + "/followers/",
      token: token,
      locale: locale,
    });
    return resp.data.results;
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
  }
};

async function getProjectByIdIfExists(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return parseProject(resp.data);
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getIsUserFollowing(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/am_i_following/",
      token: token,
      locale: locale,
    });
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

async function getPostsByProject(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/posts/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getCommentsByProject(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/comments/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getProjectMembersByIdIfExists(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/members/",
      token: token,
      locale: locale,
    });
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
    short_description: project.short_description,
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
      permission: m.role.role_type,
      availability: m.availability,
      name: m.user.first_name + " " + m.user.last_name,
      location: m.user.location,
    };
  });
}
