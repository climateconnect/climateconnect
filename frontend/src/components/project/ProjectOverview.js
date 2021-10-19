import {
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EmailIcon from "@material-ui/icons/Email";
import ExploreIcon from "@material-ui/icons/Explore";
import LanguageIcon from "@material-ui/icons/Language";
import PlaceIcon from "@material-ui/icons/Place";
import Router from "next/router";
import React, { useContext, useEffect, useState } from "react";
import Linkify from "react-linkify";
import Cookies from "universal-cookie";

// Relative imports
import ROLE_TYPES from "../../../public/data/role_types";
import { apiRequest, redirect } from "../../../public/lib/apiOperations";
import { getParams } from "../../../public/lib/generalOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
import getTexts from "../../../public/texts/texts";
import MessageContent from "../communication/MessageContent";
import UserContext from "../context/UserContext";
import ProjectFollowersDialog from "../dialogs/ProjectFollowersDialog";
import { getImageUrl } from "./../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  ...projectOverviewStyles(theme),
  contactProjectButton: {
    marginLeft: theme.spacing(1),
    maxHeight: 40,
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
  infoBottomBar: {
    display: "flex",
    marginTop: theme.spacing(3),
    justifyContent: "flex-start",
  },
  smallScreenHeader: {
    fontSize: "calc(1.6rem + 6 * ((100vw - 320px) / 680))",
  },
  followingButton: {
    height: 40,
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
  smallScreen,
  handleToggleFollowProject,
  isUserFollowing,
  followingChangePending,
  contactProjectCreatorButtonRef,
}) {
  const classes = useStyles();
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

  // TODO: fix, can't request to join a project you're already a member of!
  useEffect(() => {
    if (requestedToJoinProject) {
      try {
        handleSendProjectJoinRequest();
      } catch (error) {
        console.error();
      }
    }
  }, []);

  return (
    <Container className={classes.projectOverview}>
      {smallScreen ? (
        <SmallScreenOverview
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
    </Container>
  );
}

/**
 * Button to request membership for a project. Updates text
 * based on whether the user has requested membership or not already.
 */
const RequestMembershipButton = ({ requestedToJoin, handleSendProjectJoinRequest }) => {
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
}) {
  const classes = useStyles();

  return (
    <>
      <img
        className={classes.fullWidthImage}
        src={getImageUrl(project.image)}
        alt={texts.project_image_of_project + " " + project.name}
      />
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
        <div className={classes.infoBottomBar}>
          {/* Add more vertical separation on mobile views between the tabs and the upper section. */}
          <Box marginBottom={3} display="flex">
            {/* If the user is an admin on the project, or is already part
            of the project, then we don't want to show the membership request button. */}
            {!hasAdminPermissions && (
              <Box marginRight={2}>
                <RequestMembershipButton
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
      </div>
    </>
  );
}

function LargeScreenOverview({
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
}) {
  const classes = useStyles();

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
            {/* If the user is an admin on the project, or is already part
            of the project, then we don't want to show the membership request button. */}
            {!hasAdminPermissions && (
              <Box marginRight={3}>
                <RequestMembershipButton
                  handleSendProjectJoinRequest={handleSendProjectJoinRequest}
                  requestedToJoin={requestedToJoinProject}
                />
              </Box>
            )}

            <FollowButton
              followingChangePending={followingChangePending}
              handleToggleFollowProject={handleToggleFollowProject}
              hasAdminPermissions={hasAdminPermissions}
              isUserFollowing={isUserFollowing}
              project={project}
              texts={texts}
              toggleShowFollowers={toggleShowFollowers}
            />

            {!hasAdminPermissions && (
              <Tooltip title={texts.contact_the_projects_creator_with_just_one_click}>
                <Button
                  className={classes.contactProjectButton}
                  variant="contained"
                  color="primary"
                  onClick={handleClickContact}
                  startIcon={<EmailIcon />}
                  ref={contactProjectCreatorButtonRef}
                >
                  {texts.contact_creator}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

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
