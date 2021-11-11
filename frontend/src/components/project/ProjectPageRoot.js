import { Container, Tab, Tabs, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Router from "next/router";
import React, { useContext, useEffect, useRef } from "react";
import ROLE_TYPES from "../../../public/data/role_types";
import { apiRequest, redirect } from "../../../public/lib/apiOperations";
import { getParams } from "../../../public/lib/generalOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import ElementOnScreen from "../hooks/ElementOnScreen";
import ElementSpaceToRight from "../hooks/ElementSpaceToRight";
import VisibleFooterHeight from "../hooks/VisibleFooterHeight";
import Tutorial from "../tutorial/Tutorial";
import ProjectInteractionButtons from "./Buttons/ProjectInteractionButtons";
import ProjectCommentsContent from "./ProjectCommentsContent";
import ProjectContent from "./ProjectContent";
import ProjectOverview from "./ProjectOverview";
import ProjectTeamContent from "./ProjectTeamContent";
import { useLongPress } from "use-long-press";
import { NOTIFICATION_TYPES } from "../communication/notifications/Notification";

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
  projectInteractionButtonContainer: {
    position: "relative",
  },
}));

export default function ProjectPageRoot({
  project,
  token,
  setMessage,
  isUserFollowing,
  isUserLiking,
  user,
  setCurComments,
  followingChangePending,
  likingChangePending,
  texts,
  projectAdmin,
  numberOfLikes,
  numberOfFollowers,
  handleLike,
  handleFollow,
}) {
  const visibleFooterHeight = VisibleFooterHeight({});
  const tabContentRef = useRef(null);
  const tabContentContainerSpaceToRight = ElementSpaceToRight({ el: tabContentRef.current });

  const classes = useStyles();
  const { locale } = useContext(UserContext);

  const screenSize = {
    belowTiny: useMediaQuery((theme) => theme.breakpoints.down("xs")),
    belowSmall: useMediaQuery((theme) => theme.breakpoints.down("sm")),
    belowMedium: useMediaQuery("(max-width:1100px)"),
    belowLarge: useMediaQuery((theme) => theme.breakpoints.down("xl")),
  };

  const [hash, setHash] = React.useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState({
    follow: false,
    leave: false,
    like: false,
  });
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
    const maxNumberTeamMembers = 12;
    if (project && project.team) {
      if (project.team.length >= maxNumberTeamMembers) {
        teamLabel += ` • ${maxNumberTeamMembers}+`;
      } else if (project.team.length < maxNumberTeamMembers && project.team.length > 0) {
        teamLabel += ` • ${project.team.length}`;
      }
    }
    return teamLabel;
  };

  // pagination will only return 10 comments
  const discussionTabLabel = () => {
    let discussionLabel = texts.discussion;
    const maxNumberComments = 10;
    const numberOfParentComments = project.comments.length;
    const numberOfReplies = project.comments.reduce((total, p) => total + p?.replies?.length, 0);
    const numberOfComments = numberOfParentComments + numberOfReplies;
    if (project && project.comments) {
      if (project.comments.length >= maxNumberComments) {
        discussionLabel += ` • ${maxNumberComments}+`;
      } else if (project?.team?.length < maxNumberComments && numberOfComments > 0) {
        discussionLabel += ` • ${numberOfComments}`;
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

  const onLikeDialogClose = (confirmed) => {
    if (confirmed) toggleLikeProject();
    setConfirmDialogOpen({ ...confirmDialogOpen, like: false });
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
    handleFollow(new_value, false, true);
    apiRequest({
      method: "post",
      url: "/api/projects/" + project.url_slug + "/set_follow/",
      payload: { following: new_value },
      token: token,
      locale: locale,
    })
      .then(function (response) {
        handleFollow(response.data.following, true, false);
        updateFollowers();
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

  const handleToggleLikeProject = () => {
    if (!token)
      setMessage({
        message: <span>{texts.please_log_in_to_like_a_project}</span>,
        messageType: "error",
      });
    else if (isUserLiking) setConfirmDialogOpen({ ...confirmDialogOpen, like: true });
    else toggleLikeProject();
  };

  const toggleLikeProject = () => {
    const new_value = !isUserLiking;
    handleLike(new_value, false, true);
    apiRequest({
      method: "post",
      url: "/api/projects/" + project.url_slug + "/set_like/",
      payload: { liking: new_value },
      token: token,
      locale: locale,
    })
      .then(function (response) {
        handleLike(response.data.liking, true, false);
        updateLikes();
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

  const handleReadNotifications = async (notificationType) => {
    const notification_to_set_read = notifications.filter(
      (n) => n.notification_type === notificationType && n.project.url_slug === project.url_slug
    );
    await setNotificationsRead(token, notification_to_set_read, locale);
    await refreshNotifications();
  };

  const [initiallyCaughtFollowers, setInitiallyCaughtFollowers] = React.useState(false);
  const [followers, setFollowers] = React.useState([]);
  const [showFollowers, setShowFollowers] = React.useState(false);
  const toggleShowFollowers = async () => {
    setShowFollowers(!showFollowers);
    if (!initiallyCaughtFollowers) {
      await updateFollowers();
      handleReadNotifications(NOTIFICATION_TYPES.indexOf("project_follower"));
      setInitiallyCaughtFollowers(true);
    }
  };
  const updateFollowers = async () => {
    const retrievedFollowers = await getFollowers(project, token, locale);
    setFollowers(retrievedFollowers);
  };
  const [initiallyCaughtLikes, setInitiallyCaughtLikes] = React.useState(false);
  const [likes, setLikes] = React.useState([]);
  const [showLikes, setShowLikes] = React.useState(false);
  const toggleShowLikes = async () => {
    setShowLikes(!showLikes);
    if (!initiallyCaughtLikes) {
      await updateLikes();
      handleReadNotifications(NOTIFICATION_TYPES.indexOf("project_like"));
      setInitiallyCaughtLikes(true);
    }
  };
  const updateLikes = async () => {
    const retrievedLikes = await getLikes(project, token, locale);
    setLikes(retrievedLikes);
  };
  const [gotParams, setGotParams] = React.useState(false);
  useEffect(() => {
    if (!gotParams) {
      const params = getParams(window.location.href);
      if (params.show_followers && !showFollowers) toggleShowFollowers();
      if (params.show_likes && !showLikes) toggleShowLikes();
      setGotParams(true);
    }
  });
  const bindLike = useLongPress(() => {
    toggleShowLikes();
  });
  const bindFollow = useLongPress(() => {
    toggleShowFollowers();
  });

  return (
    <div className={classes.root}>
      <ProjectOverview
        project={project}
        screenSize={screenSize}
        handleToggleFollowProject={handleToggleFollowProject}
        handleToggleLikeProject={handleToggleLikeProject}
        isUserFollowing={isUserFollowing}
        isUserLiking={isUserLiking}
        followingChangePending={followingChangePending}
        likingChangePending={likingChangePending}
        contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
        projectAdmin={projectAdmin}
        handleClickContact={handleClickContact}
        hasAdminPermissions={hasAdminPermissions}
        toggleShowFollowers={toggleShowFollowers}
        user={user}
        followers={followers}
        locale={locale}
        showFollowers={showFollowers}
        initiallyCaughtFollowers={initiallyCaughtFollowers}
        likes={likes}
        toggleShowLikes={toggleShowLikes}
        showLikes={showLikes}
        initiallyCaughtLikes={initiallyCaughtLikes}
        numberOfLikes={numberOfLikes}
        numberOfFollowers={numberOfFollowers}
      />

      <Container className={classes.noPadding}>
        <div className={classes.tabsWrapper} ref={projectTabsRef}>
          <Tabs
            variant={screenSize.belowSmall ? "fullWidth" : "standard"}
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
      <Container className={classes.projectInteractionButtonContainer}>
        <ProjectInteractionButtons
          screenSize={screenSize}
          project={project}
          projectAdmin={projectAdmin}
          handleClickContact={handleClickContact}
          hasAdminPermissions={hasAdminPermissions}
          texts={texts}
          visibleFooterHeight={visibleFooterHeight}
          isUserFollowing={isUserFollowing}
          isUserLiking={isUserLiking}
          handleToggleFollowProject={handleToggleFollowProject}
          handleToggleLikeProject={handleToggleLikeProject}
          toggleShowFollowers={toggleShowFollowers}
          followingChangePending={followingChangePending}
          likingChangePending={likingChangePending}
          messageButtonIsVisible={messageButtonIsVisible}
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          tabContentContainerSpaceToRight={tabContentContainerSpaceToRight}
          numberOfFollowers={numberOfFollowers}
          numberOfLikes={numberOfLikes}
          bindLike={bindLike}
          bindFollow={bindFollow}
        />
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
        confirmText={texts.yes}
        cancelText={texts.no}
      />
      <ConfirmDialog
        open={confirmDialogOpen.like}
        onClose={onLikeDialogClose}
        title={texts.do_you_really_want_to_dislike}
        text={
          <span className={classes.dialogText}>
            {texts.are_you_sure_that_you_want_to_dislike_this_project}
          </span>
        }
        confirmText={texts.yes}
        cancelText={texts.no}
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
        confirmText={texts.yes}
        cancelText={texts.no}
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

const getLikes = async (project, token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + project.url_slug + "/likes/",
      token: token,
      locale: locale,
    });
    return resp.data.results;
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
  }
};
