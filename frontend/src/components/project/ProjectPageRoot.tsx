import { Container, Tab, Tabs, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Router from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { useLongPress } from "use-long-press";
import ROLE_TYPES from "../../../public/data/role_types";
import { apiRequest, getLocalePrefix, redirect } from "../../../public/lib/apiOperations";
import { getParams } from "../../../public/lib/generalOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import getTexts from "../../../public/texts/texts";
import { NOTIFICATION_TYPES } from "../communication/notifications/Notification";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import ElementOnScreen from "../hooks/ElementOnScreen";
import ElementSpaceToRight from "../hooks/ElementSpaceToRight";
import VisibleFooterHeight from "../hooks/VisibleFooterHeight";
import SocialMediaShareButton from "../shareContent/SocialMediaShareButton";
import Tutorial from "../tutorial/Tutorial";
import ProjectInteractionButtons from "./Buttons/ProjectInteractionButtons";
import ProjectCommentsContent from "./ProjectCommentsContent";
import ProjectContent from "./ProjectContent";
import ProjectOverview from "./ProjectOverview";
import ProjectSideBar from "./ProjectSideBar";
import ProjectTeamContent from "./ProjectTeamContent";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    color: theme.palette.grey[800],
    position: "relative",
  },

  buttonText: {
    color: theme.palette.primary.main,
  },

  tabsContainerWithoutPadding: {
    padding: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.grey[500]}`,
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
    [theme.breakpoints.down("sm")]: {
      width: 125,
    },
  },
  projectInteractionButtonContainer: {
    position: "relative",
  },
  shareButtonContainer: {
    paddingRight: theme.spacing(4),
  },

  showAllProjectsButton: {
    marginTop: theme.spacing(1),
    fontSize: 14,
    width: "100%",
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
  projectAdmin,
  numberOfLikes,
  numberOfFollowers,
  handleLike,
  handleFollow,
  similarProjects,
  showSimilarProjects,
  handleHideContent,
  requestedToJoinProject,
  handleJoinRequest,
}) {
  const visibleFooterHeight = VisibleFooterHeight({});
  const tabContentRef = useRef(null);
  const tabContentContainerSpaceToRight = ElementSpaceToRight({ el: tabContentRef.current });
  const { locale, pathName } = useContext(UserContext);
  const classes = useStyles({
    showSimilarProjects: showSimilarProjects,
    locale: locale,
  });

  const texts = getTexts({
    locale: locale,
    page: "project",
    project: project,
    creator: projectAdmin,
  });

  const screenSize = {
    belowTiny: useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm")),
    belowSmall: useMediaQuery<Theme>((theme) => theme.breakpoints.down("md")),
    belowMedium: showSimilarProjects
      ? useMediaQuery<Theme>("(max-width:1300px)")
      : useMediaQuery<Theme>("(max-width:1100px)"),
    belowLarge: useMediaQuery<Theme>((theme) => theme.breakpoints.down("xl")),
  };

  const [hash, setHash] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState({
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

  /**
   * Calls backend, sending a request to join this project based
   * on user token stored in cookies.
   */
  const handleSendProjectJoinRequest = async () => {
    // Get the actual project name from the URL, removing any query params
    // and projects/ prefix. For example,
    // "/projects/Anotherproject6?projectId=Anotherproject6" -> "Anotherproject6"
    const projectName = pathName?.split("/")[2].split("?")[0];
    // Also strip any trailing '#' too.
    const strippedProjectName = projectName.endsWith("#") ? projectName.slice(0, -1) : projectName;

    const cookies = new Cookies();
    const token = cookies.get("auth_token");

    try {
      await apiRequest({
        method: "post",
        url: `/api/projects/${strippedProjectName}/request_membership/${user.url_slug}/`,
        payload: {
          message: "Would like to join the project!",
          // TODO: currently, we default user's availability to 4. In
          // the future, we could consider customizing this option
          user_availability: "4",
        },

        headers: {
          Authorization: `Token ${token}`,
        },
      });
      showFeedbackMessage({
        message: texts.your_request_has_been_sent,
        success: true,
      });
      handleJoinRequest(true);
    } catch (error) {
      showFeedbackMessage({
        message: error?.response?.data?.message,
        error: true,
      });
      if (error?.response?.data?.message === "Request already exists to join project") {
        handleJoinRequest(true);
      }
    }
  };

  const [tabValue, setTabValue] = useState(hash ? typesByTabValue.indexOf(hash) : 0);

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

  const { showFeedbackMessage } = useContext(FeedbackContext);

  const handleToggleFollowProject = () => {
    if (!token)
      showFeedbackMessage({
        message: <span>{texts.please_log_in_to_follow_a_project}</span>,
        error: true,
        promptLogIn: true,
      });
    else if (isUserFollowing) setConfirmDialogOpen({ ...confirmDialogOpen, follow: true });
    else toggleFollowProject();
  };

  const toggleFollowProject = () => {
    handleFollow(isUserFollowing, false, true);
    apiRequest({
      method: "post",
      url: "/api/projects/" + project.url_slug + "/set_follow/",
      payload: { following: !isUserFollowing },
      token: token,
      locale: locale,
    })
      .then(function (response) {
        handleFollow(response.data.following, true, false);
        updateFollowers();
        showFeedbackMessage({
          message: response.data.message,
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error && error.reponse) console.log(error.response);
      });
  };

  const handleToggleLikeProject = () => {
    if (!token)
      showFeedbackMessage({
        message: <span>{texts.please_log_in_to_like_a_project}</span>,
        error: true,
        promptLogIn: true,
      });
    else if (isUserLiking) setConfirmDialogOpen({ ...confirmDialogOpen, like: true });
    else toggleLikeProject();
  };

  const toggleLikeProject = () => {
    handleLike(isUserLiking, false, true);
    apiRequest({
      method: "post",
      url: "/api/projects/" + project.url_slug + "/set_like/",
      payload: { liking: !isUserLiking },
      token: token,
      locale: locale,
    })
      .then(function (response) {
        handleLike(response.data.liking, true, false);
        updateLikes();
        showFeedbackMessage({
          message: response.data.message,
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
        message: `You can't leave a project as the creator. Please give the creator role to another team member by clicking "Manage Members" in the team tab.`,
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

  const [initiallyCaughtFollowers, setInitiallyCaughtFollowers] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
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
  const [initiallyCaughtLikes, setInitiallyCaughtLikes] = useState(false);
  const [likes, setLikes] = useState([]);
  const [showLikes, setShowLikes] = useState(false);
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

  const [showRequesters, setShowRequesters] = useState(false);
  const toggleShowRequests = () => {
    setShowRequesters(!showRequesters);
    handleReadNotifications(NOTIFICATION_TYPES.indexOf("join_project_request"));
  };

  const [gotParams, setGotParams] = useState(false);
  useEffect(() => {
    if (!gotParams) {
      const params = getParams(window.location.href);
      if (params.show_followers && !showFollowers) toggleShowFollowers();
      if (params.show_likes && !showLikes) toggleShowLikes();
      if (params.show_join_requests && !showRequesters) toggleShowRequests();
      setGotParams(true);
    }
  });
  const bindLike = useLongPress(() => {
    toggleShowLikes();
  });
  const bindFollow = useLongPress(() => {
    toggleShowFollowers();
  });

  const apiEndpointShareButton = `/api/projects/${project.url_slug}/set_shared_project/`;
  const projectAdminName = project?.creator.name ? project?.creator.name : projectAdmin.name;
  const projectLinkPath = `${getLocalePrefix(locale)}/projects/${project.url_slug}`;
  const messageTitleShareButton = `${texts.climate_protection_project_by}${projectAdminName}: ${project.name}`;
  const mailBodyShareButton = texts.share_project_email_body;
  const dialogTitleShareButton = texts.tell_others_about_this_project;

  const latestParentComment = [project.comments[0]];

  return (
    <div className={classes.root}>
      <ProjectOverview
        apiEndpointShareButton={apiEndpointShareButton}
        contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
        dialogTitleShareButton={dialogTitleShareButton}
        followers={followers}
        followingChangePending={followingChangePending}
        handleClickContact={handleClickContact}
        handleToggleFollowProject={handleToggleFollowProject}
        handleToggleLikeProject={handleToggleLikeProject}
        hasAdminPermissions={hasAdminPermissions}
        initiallyCaughtFollowers={initiallyCaughtFollowers}
        initiallyCaughtLikes={initiallyCaughtLikes}
        isUserFollowing={isUserFollowing}
        isUserLiking={isUserLiking}
        likes={likes}
        likingChangePending={likingChangePending}
        locale={locale}
        mailBodyShareButton={mailBodyShareButton}
        messageTitleShareButton={messageTitleShareButton}
        numberOfFollowers={numberOfFollowers}
        numberOfLikes={numberOfLikes}
        project={project}
        projectAdmin={projectAdmin}
        projectLinkPath={projectLinkPath}
        screenSize={screenSize}
        showFollowers={showFollowers}
        showLikes={showLikes}
        toggleShowFollowers={toggleShowFollowers}
        toggleShowLikes={toggleShowLikes}
        token={token}
        user={user}
      />

      <Container className={classes.tabsContainerWithoutPadding}>
        <div ref={projectTabsRef}>
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

        {!screenSize.belowSmall && (
          <SocialMediaShareButton
            containerClassName={classes.shareButtonContainer}
            contentLinkPath={projectLinkPath}
            apiEndpoint={apiEndpointShareButton}
            locale={locale}
            token={token}
            messageTitle={messageTitleShareButton}
            tinyScreen={screenSize.belowTiny}
            smallScreen={screenSize.belowSmall}
            mailBody={mailBodyShareButton}
            texts={texts}
            dialogTitle={dialogTitleShareButton}
          />
        )}
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

      <Container className={classes.tabContent} ref={tabContentRef}>
        <TabContent value={tabValue} index={0}>
          <ProjectContent
            project={project}
            leaveProject={requestLeaveProject}
            projectDescriptionRef={projectDescriptionRef}
            collaborationSectionRef={collaborationSectionRef}
            discussionTabLabel={discussionTabLabel()}
            latestParentComment={latestParentComment}
            handleTabChange={handleTabChange}
            typesByTabValue={typesByTabValue}
            projectTabsRef={projectTabsRef}
            showRequesters={showRequesters}
            toggleShowRequests={toggleShowRequests}
            handleSendProjectJoinRequest={handleSendProjectJoinRequest}
            requestedToJoinProject={requestedToJoinProject}
            token={token}
          />
        </TabContent>
        <TabContent value={tabValue} index={1}>
          <ProjectTeamContent
            project={project}
            handleReadNotifications={handleReadNotifications}
            leaveProject={requestLeaveProject}
          />
        </TabContent>

        <TabContent value={tabValue} index={2}>
          <ProjectCommentsContent
            project={project}
            user={user}
            token={token}
            setCurComments={setCurComments}
          />
        </TabContent>
        {screenSize.belowSmall && (
          <ProjectSideBar
            showSimilarProjects={showSimilarProjects}
            isSmallScreen
            texts={texts}
            handleHideContent={handleHideContent}
            similarProjects={similarProjects}
            locale={locale}
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
        typesByTabValue={typesByTabValue}
        handleTabChange={handleTabChange}
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
