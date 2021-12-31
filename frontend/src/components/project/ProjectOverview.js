<<<<<<< HEAD
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Tooltip,
  Typography,
} from "@material-ui/core";
=======
import { Container, Link, Tooltip, Typography } from "@material-ui/core";
>>>>>>> master
import { makeStyles } from "@material-ui/core/styles";
import ExploreIcon from "@material-ui/icons/Explore";
import LanguageIcon from "@material-ui/icons/Language";
import PlaceIcon from "@material-ui/icons/Place";
<<<<<<< HEAD
import Router from "next/router";
import React, { useContext, useEffect, useState } from "react";
import Linkify from "react-linkify";
import Cookies from "universal-cookie";

// Relative imports
import RequestMembershipButton from "./RequestMembershipButton";
import ROLE_TYPES from "../../../public/data/role_types";
import { apiRequest, redirect } from "../../../public/lib/apiOperations";
import { getParams } from "../../../public/lib/generalOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
=======
import React from "react";
import Linkify from "react-linkify";
>>>>>>> master
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
import getTexts from "../../../public/texts/texts";
import MessageContent from "../communication/MessageContent";
import ProjectFollowersDialog from "../dialogs/ProjectFollowersDialog";
import ProjectLikesDialog from "../dialogs/ProjectLikesDialog";
import SocialMediaShareButton from "../shareContent/SocialMediaShareButton";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import ContactCreatorButton from "./Buttons/ContactCreatorButton";
import FollowButton from "./Buttons/FollowButton";
import GoBackFromProjectPageButton from "./Buttons/GoBackFromProjectPageButton";
import LikeButton from "./Buttons/LikeButton";

const useStyles = makeStyles((theme) => ({
  ...projectOverviewStyles(theme),
  infoBottomBar: (props) => ({
    display: "flex",
    marginTop: theme.spacing(3),
    justifyContent: props.hasAdminPermissions ? "flex-start" : "space-between",
  }),
  smallScreenHeader: {
    fontSize: "calc(1.6rem + 6 * ((100vw - 320px) / 680))",
    paddingBottom: theme.spacing(2),
  },
  rootLinksContainer: {
    display: "flex",
    justifyContent: "space-around",
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(1),
  },
  linkContainer: {
    display: "flex",
<<<<<<< HEAD
    marginTop: theme.spacing(3),
    justifyContent: "flex-start",
=======
    cursor: "pointer",
    marginRight: theme.spacing(1),
>>>>>>> master
  },
  linkIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  largeScreenHeader: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: "center",
  },
  goBackButtonContainer: {
    position: "absolute",
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  shareButtonContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1.6),
  },
  imageContainer: {
    position: "relative",
  },
}));

const componentDecorator = (href, text, key) => (
  <Link
    color="primary"
    underline="always"
    href={href}
    key={key}
    target="_blank"
    rel="noopener noreferrer"
  >
    {text}
  </Link>
);

export default function ProjectOverview({
  project,
  screenSize,
  handleToggleFollowProject,
  handleToggleLikeProject,
  isUserFollowing,
  isUserLiking,
  followingChangePending,
  likingChangePending,
  contactProjectCreatorButtonRef,
  projectAdmin,
  handleClickContact,
  toggleShowFollowers,
  hasAdminPermissions,
  user,
  followers,
  likes,
  locale,
  showFollowers,
  showLikes,
  initiallyCaughtFollowers,
  initiallyCaughtLikes,
  toggleShowLikes,
  numberOfLikes,
  numberOfFollowers,
  projectLinkPath,
  apiEndpointShareButton,
  token,
  messageTitleShareButton,
  mailBodyShareButton,
  dialogTitleShareButton,
}) {
  const classes = useStyles();
<<<<<<< HEAD
  const cookies = new Cookies();
  const {
    locale,
    notifications,
    pathName,
    refreshNotifications,
    setNotificationsRead,
    user,
  } = useContext(UserContext);

  const [requestedToJoinProject, setRequestedToJoinProject] = useState(false);

  const texts = getTexts({ page: "project", locale: locale, project: project });
  const token = cookies.get("token");

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

  /**
   * Calls backend, sending a request to join this project based
   * on user token stored in cookies.
   */
  const handleSendProjectJoinRequest = async (event) => {
    // Get the actual project name from the URL, removing any query params
    // and projects/ prefix. For example,
    // "projects/Anotherproject6?projectId=Anotherproject6" -> "Anotherproject6"
    const projectName = pathName?.split("/")[1].split("?")[0];

    const cookies = new Cookies();
    const token = cookies.get("token");

    try {
      const response = await apiRequest({
        method: "post",
        url: `/api/projects/${projectName}/request_membership/${user.url_slug}/`,
        payload: {
          message: "Would like to join cothe project!",
          // TODO: fix user_availability
          user_availability: "4",
        },

        headers: {
          Authorization: `Token ${token}`,
        },
      });

      console.log(response);
    } catch (error) {
      if (error?.response?.data?.message === "Request already exists to join project") {
        console.log("Already requested to join this project!");
        setRequestedToJoinProject(true);
      }
    }
  };

  const user_permission =
    user && project.team && project.team.find((m) => m.id === user.id)
      ? project.team.find((m) => m.id === user.id).permission
      : null;
  const hasAdminPermissions =
    user_permission && [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(user_permission);

  const [initiallyCaughtFollowers, setInitiallyCaughtFollowers] = useState(false);
  const [followers, setFollowers] = useState([]);

  const [showFollowers, setShowFollowers] = useState(false);
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

  const [gotParams, setGotParams] = useState(false);
  useEffect(() => {
    if (!gotParams) {
      const params = getParams(window.location.href);
      if (params.show_followers && !showFollowers) toggleShowFollowers();
      setGotParams(true);
    }
  });
=======

  const texts = getTexts({ page: "project", locale: locale, project: project });
>>>>>>> master

  // TODO: fix, can't request to join a project you're already a member of!
  useEffect(() => {
    if (!requestedToJoinProject) {
      try {
        handleSendProjectJoinRequest();
      } catch (error) {
        console.error();
      }
    }
  }, []);

  return (
    <Container className={classes.projectOverview}>
      {screenSize.belowSmall ? (
        <SmallScreenOverview
<<<<<<< HEAD
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          followingChangePending={followingChangePending}
          handleClickContact={handleClickContact}
          handleToggleFollowProject={handleToggleFollowProject}
          handleSendProjectJoinRequest={handleSendProjectJoinRequest}
          hasAdminPermissions={hasAdminPermissions}
          isUserFollowing={isUserFollowing}
          project={project}
          requestedToJoinProject={requestedToJoinProject}
          texts={texts}
          toggleShowFollowers={toggleShowFollowers}
        />
      ) : (
        <LargeScreenOverview
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          followingChangePending={followingChangePending}
=======
          project={project}
          texts={texts}
          screenSize={screenSize}
          locale={locale}
          projectLinkPath={projectLinkPath}
          apiEndpointShareButton={apiEndpointShareButton}
          token={token}
          messageTitleShareButton={messageTitleShareButton}
          mailBodyShareButton={mailBodyShareButton}
          dialogTitleShareButton={dialogTitleShareButton}
        />
      ) : (
        <LargeScreenOverview
          project={project}
          handleToggleFollowProject={handleToggleFollowProject}
          handleToggleLikeProject={handleToggleLikeProject}
          isUserFollowing={isUserFollowing}
          isUserLiking={isUserLiking}
>>>>>>> master
          handleClickContact={handleClickContact}
          handleToggleFollowProject={handleToggleFollowProject}
          handleSendProjectJoinRequest={handleSendProjectJoinRequest}
          hasAdminPermissions={hasAdminPermissions}
          isUserFollowing={isUserFollowing}
          project={project}
          requestedToJoinProject={requestedToJoinProject}
          texts={texts}
<<<<<<< HEAD
          toggleShowFollowers={toggleShowFollowers}
=======
          projectAdmin={projectAdmin}
          likes={likes}
          toggleShowLikes={toggleShowLikes}
          likingChangePending={likingChangePending}
          screenSize={screenSize}
          numberOfLikes={numberOfLikes}
          numberOfFollowers={numberOfFollowers}
>>>>>>> master
        />
      )}
      <ProjectFollowersDialog
        open={showFollowers}
        loading={!initiallyCaughtFollowers}
        followers={followers}
        project={project}
        onClose={toggleShowFollowers}
        user={user}
        url={"projects/" + project.url_slug + "?show_followers=true"}
      />
      <ProjectLikesDialog
        open={showLikes}
        loading={!initiallyCaughtLikes}
        likes={likes}
        project={project}
        onClose={toggleShowLikes}
        user={user}
        url={"projects/" + project.url_slug + "?show_likes=true"}
      />
    </Container>
  );
}

/**
 * Button to request membership for a project. Updates text
 * based on whether the user has requested membership or not already.
 */
const RequestMembershipButtonWrapper = ({ requestedToJoin, handleSendProjectJoinRequest }) => {
  // TODO(Piper): determine availabiilty approach
  // return <RequestMembershipButton />;

  return requestedToJoin ? (
    <Button disabled variant="contained" color="primary" onClick={handleSendProjectJoinRequest}>
      Already requested
    </Button>
  ) : (
    <Button variant="contained" color="primary" onClick={handleSendProjectJoinRequest}>
      Request to Join +
    </Button>
  );
};

function SmallScreenOverview({
<<<<<<< HEAD
  contactProjectCreatorButtonRef,
  followingChangePending,
  handleClickContact,
  handleSendProjectJoinRequest,
  handleToggleFollowProject,
  hasAdminPermissions,
  isUserFollowing,
  project,
  requestedToJoinProject,
  texts,
  toggleShowFollowers,
=======
  project,
  texts,
  screenSize,
  locale,
  projectLinkPath,
  apiEndpointShareButton,
  token,
  messageTitleShareButton,
  mailBodyShareButton,
  dialogTitleShareButton,
>>>>>>> master
}) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.imageContainer}>
        {screenSize.belowTiny && (
          <GoBackFromProjectPageButton
            containerClassName={classes.goBackButtonContainer}
            texts={texts}
            tinyScreen={screenSize.belowTiny}
            locale={locale}
          />
        )}
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
        <img
          className={classes.fullWidthImage}
          src={getImageUrl(project.image)}
          alt={texts.project_image_of_project + " " + project.name}
        />
      </div>
      <div className={classes.blockProjectInfo}>
        <Typography component="h1" variant="h3" className={classes.smallScreenHeader}>
          {project.name}
        </Typography>

        <Typography>{project?.short_description}</Typography>
        <div className={classes.projectInfoEl}>
          <Typography>
            <Tooltip title={texts.location}>
              <PlaceIcon color="primary" className={classes.icon} />
            </Tooltip>{" "}
            {project.location}
          </Typography>
        </div>
        {project.website && (
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title={texts.website}>
                <LanguageIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              <Linkify componentDecorator={componentDecorator}>{project.website}</Linkify>
            </Typography>
          </div>
        )}
        <div className={classes.projectInfoEl}>
          <Typography>
            <Tooltip title={texts.categories}>
              <ExploreIcon color="primary" className={classes.icon} />
            </Tooltip>{" "}
            {project.tags.join(", ")}
          </Typography>
        </div>
<<<<<<< HEAD
        <div className={classes.infoBottomBar}>
          {/* Add more vertical separation on mobile views between the tabs and the upper section. */}
          <Box marginBottom={3} display="flex">
            {/* If the user is an admin on the project, or is already part
            of the project, then we don't want to show the membership request button. */}
            {!hasAdminPermissions && (
              <Box marginRight={2}>
                <RequestMembershipButtonWrapper
                  handleSendProjectJoinRequest={handleSendProjectJoinRequest}
                  requestedToJoin={requestedToJoinProject}
                />
              </Box>
            )}

            <FollowButton
              isUserFollowing={isUserFollowing}
              handleToggleFollowProject={handleToggleFollowProject}
              project={project}
              hasAdminPermissions={hasAdminPermissions}
              toggleShowFollowers={toggleShowFollowers}
              followingChangePending={followingChangePending}
              texts={texts}
            />

            {!hasAdminPermissions && (
              <Button
                className={classes.contactProjectButton}
                variant="contained"
                color="primary"
                onClick={handleClickContact}
                ref={contactProjectCreatorButtonRef}
              >
                {texts.contact}
              </Button>
            )}
          </Box>
        </div>
=======
>>>>>>> master
      </div>
    </>
  );
}

function LargeScreenOverview({
<<<<<<< HEAD
  contactProjectCreatorButtonRef,
  followingChangePending,
=======
  project,
  handleToggleFollowProject,
  handleToggleLikeProject,
  isUserFollowing,
  isUserLiking,
>>>>>>> master
  handleClickContact,
  handleSendProjectJoinRequest,
  handleToggleFollowProject,
  hasAdminPermissions,
  isUserFollowing,
  project,
  requestedToJoinProject,
  texts,
<<<<<<< HEAD
  toggleShowFollowers,
}) {
  const classes = useStyles();

=======
  projectAdmin,
  likes,
  toggleShowLikes,
  likingChangePending,
  screenSize,
  numberOfLikes,
  numberOfFollowers,
}) {
  const classes = useStyles({ hasAdminPermissions: hasAdminPermissions });
>>>>>>> master
  return (
    <>
      <Typography component="h1" variant="h4" className={classes.largeScreenHeader}>
        {project.name}
      </Typography>
      <div className={classes.flexContainer}>
        <img
          className={classes.inlineImage}
          src={getImageUrl(project.image)}
          alt={texts.project_image_of_project + " " + project.name}
        />
        <div className={classes.inlineProjectInfo}>
          <Typography component="h2" variant="h5" className={classes.subHeader}>
            {texts.summary}
          </Typography>
          <Typography component="div">
            <MessageContent content={project?.short_description} />
          </Typography>
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title={texts.location}>
                <PlaceIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              {project.location}
            </Typography>
          </div>
          {project.website && (
            <div className={classes.projectInfoEl}>
              <Typography>
                <Tooltip title={texts.website}>
                  <LanguageIcon color="primary" className={classes.icon} />
                </Tooltip>{" "}
                <Linkify componentDecorator={componentDecorator}>{project.website}</Linkify>
              </Typography>
            </div>
          )}
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title={texts.categories}>
                <ExploreIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              {project.tags.join(", ")}
            </Typography>
          </div>
          <div className={classes.infoBottomBar}>
<<<<<<< HEAD
            {/* If the user is an admin on the project, or is already part
            of the project, then we don't want to show the membership request button. */}
            {!hasAdminPermissions && (
              <Box marginRight={3}>
                <RequestMembershipButtonWrapper
                  handleSendProjectJoinRequest={handleSendProjectJoinRequest}
                  requestedToJoin={requestedToJoinProject}
                />
              </Box>
            )}

=======
            <LikeButton
              texts={texts}
              isUserLiking={isUserLiking}
              handleToggleLikeProject={handleToggleLikeProject}
              project={project}
              likes={likes}
              toggleShowLikes={toggleShowLikes}
              likingChangePending={likingChangePending}
              screenSize={screenSize}
              hasAdminPermissions={hasAdminPermissions}
              numberOfLikes={numberOfLikes}
            />
>>>>>>> master
            <FollowButton
              followingChangePending={followingChangePending}
              handleToggleFollowProject={handleToggleFollowProject}
              hasAdminPermissions={hasAdminPermissions}
              isUserFollowing={isUserFollowing}
              project={project}
              texts={texts}
<<<<<<< HEAD
              toggleShowFollowers={toggleShowFollowers}
=======
              screenSize={screenSize}
              numberOfFollowers={numberOfFollowers}
>>>>>>> master
            />

            {!hasAdminPermissions && (
              <ContactCreatorButton
                creator={projectAdmin}
                contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
                handleClickContact={handleClickContact}
                customCardWidth={220}
                withInfoCard={true}
                withIcons={true}
                collapsable={true}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
<<<<<<< HEAD

function FollowButton({
  project,
  isUserFollowing,
  handleToggleFollowProject,
  hasAdminPermissions,
  toggleShowFollowers,
  followingChangePending,
  texts,
}) {
  const classes = useStyles({ hasAdminPermissions: hasAdminPermissions });
  return (
    <span className={classes.followButtonContainer}>
      <Button
        onClick={handleToggleFollowProject}
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
=======
>>>>>>> master
