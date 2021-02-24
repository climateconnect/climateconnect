import { Button, CircularProgress, Container, Link, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EmailIcon from "@material-ui/icons/Email";
import ExploreIcon from "@material-ui/icons/Explore";
import LanguageIcon from "@material-ui/icons/Language";
import PlaceIcon from "@material-ui/icons/Place";
import Axios from "axios";
import Router from "next/router";
import React, { useContext, useEffect } from "react";
import Linkify from "react-linkify";
import Cookies from "universal-cookie";
import tokenConfig from "../../../public/config/tokenConfig";
import { redirect } from "../../../public/lib/apiOperations";
import { getParams } from "../../../public/lib/generalOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
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
    justifyContent: "space-between",
  },
  smallScreenHeader: {
    fontSize: "calc(1.6rem + 6 * ((100vw - 320px) / 680))",
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
}) {
  const classes = useStyles();
  const cookies = new Cookies();
  const { user, notifications, setNotificationsRead, refreshNotifications } = useContext(
    UserContext
  );
  const token = cookies.get("token");
  const handleClickContact = async (event) => {
    event.preventDefault();
    const creator = project.team.filter((m) => m.permission === "Creator")[0];
    if(!user) {
      return redirect("/signin", {
        redirect: window.location.pathname + window.location.search,
        errorMessage: "Please create an account or log in to contact a project's organizer.",
      });      
    }
    const chat = await startPrivateChat(creator, token);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  const user_permission =
    user && project.team && project.team.find((m) => m.id === user.id)
      ? project.team.find((m) => m.id === user.id).permission
      : null;
  const hasAdminPermissions =
    user_permission && ["Creator", "Administrator"].includes(user_permission);

  const [initiallyCaughtFollowers, setInitiallyCaughtFollowers] = React.useState(false);
  const [followers, setFollowers] = React.useState([]);
  const [showFollowers, setShowFollowers] = React.useState(false);
  const toggleShowFollowers = async () => {
    setShowFollowers(!showFollowers);
    if (!initiallyCaughtFollowers) {
      const retrievedFollowers = await getFollowers(project, token);
      const notification_to_set_read = notifications.filter(
        (n) => n.notification_type === 4 && n.project.url_slug === project.url_slug
      );
      await setNotificationsRead(token, notification_to_set_read);
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
    <Container className={classes.projectOverview}>
      {smallScreen ? (
        <SmallScreenOverview
          project={project}
          handleToggleFollowProject={handleToggleFollowProject}
          isUserFollowing={isUserFollowing}
          handleClickContact={handleClickContact}
          hasAdminPermissions={hasAdminPermissions}
          toggleShowFollowers={toggleShowFollowers}
          followingChangePending={followingChangePending}
        />
      ) : (
        <LargeScreenOverview
          project={project}
          handleToggleFollowProject={handleToggleFollowProject}
          isUserFollowing={isUserFollowing}
          handleClickContact={handleClickContact}
          hasAdminPermissions={hasAdminPermissions}
          toggleShowFollowers={toggleShowFollowers}
          followingChangePending={followingChangePending}
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

function SmallScreenOverview({
  project,
  handleToggleFollowProject,
  isUserFollowing,
  handleClickContact,
  hasAdminPermissions,
  toggleShowFollowers,
  followingChangePending,
}) {
  const classes = useStyles();
  return (
    <>
      <img
        className={classes.fullWidthImage}
        src={getImageUrl(project.image)}
        alt={project.name + "'s project image"}
      />
      <div className={classes.blockProjectInfo}>
        <Typography component="h1" variant="h3" className={classes.smallScreenHeader}>
          {project.name}
        </Typography>

        <Typography>{project?.shortdescription}</Typography>
        <div className={classes.projectInfoEl}>
          <Typography>
            <Tooltip title="Location">
              <PlaceIcon color="primary" className={classes.icon} />
            </Tooltip>{" "}
            {project.location}
          </Typography>
        </div>
        {project.website && (
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title="Website">
                <LanguageIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              <Linkify componentDecorator={componentDecorator}>{project.website}</Linkify>
            </Typography>
          </div>
        )}
        <div className={classes.projectInfoEl}>
          <Typography>
            <Tooltip title="Categories">
              <ExploreIcon color="primary" className={classes.icon} />
            </Tooltip>{" "}
            {project.tags.join(", ")}
          </Typography>
        </div>
        <div className={classes.infoBottomBar}>
          <FollowButton
            isUserFollowing={isUserFollowing}
            handleToggleFollowProject={handleToggleFollowProject}
            project={project}
            hasAdminPermissions={hasAdminPermissions}
            toggleShowFollowers={toggleShowFollowers}
            followingChangePending={followingChangePending}
          />
          {!hasAdminPermissions && (
            <Button
              className={classes.contactProjectButton}
              variant="contained"
              color="primary"
              onClick={handleClickContact}
            >
              Contact
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function LargeScreenOverview({
  project,
  handleToggleFollowProject,
  isUserFollowing,
  handleClickContact,
  hasAdminPermissions,
  toggleShowFollowers,
  followingChangePending,
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
          alt={project.name + "'s project image"}
        />
        <div className={classes.inlineProjectInfo}>
          <Typography component="h2" variant="h5" className={classes.subHeader}>
            Summary
          </Typography>
          <Typography component="div">
            <MessageContent content={project?.shortdescription} />
          </Typography>
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title="Location">
                <PlaceIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              {project.location}
            </Typography>
          </div>
          {project.website && (
            <div className={classes.projectInfoEl}>
              <Typography>
                <Tooltip title="Website">
                  <LanguageIcon color="primary" className={classes.icon} />
                </Tooltip>{" "}
                <Linkify componentDecorator={componentDecorator}>{project.website}</Linkify>
              </Typography>
            </div>
          )}
          <div className={classes.projectInfoEl}>
            <Typography>
              <Tooltip title="Categories">
                <ExploreIcon color="primary" className={classes.icon} />
              </Tooltip>{" "}
              {project.tags.join(", ")}
            </Typography>
          </div>
          <div className={classes.infoBottomBar}>
            <FollowButton
              isUserFollowing={isUserFollowing}
              handleToggleFollowProject={handleToggleFollowProject}
              project={project}
              hasAdminPermissions={hasAdminPermissions}
              toggleShowFollowers={toggleShowFollowers}
              followingChangePending={followingChangePending}
            />
            {!hasAdminPermissions && (
              <Tooltip title="Contact the project's creator with just one click!">
                <Button
                  className={classes.contactProjectButton}
                  variant="contained"
                  color="primary"
                  onClick={handleClickContact}
                  startIcon={<EmailIcon />}
                >
                  Contact organizer
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
}) {
  const classes = useStyles({ hasAdminPermissions: hasAdminPermissions });
  return (
    <span className={classes.followButtonContainer}>
      <Button
        onClick={handleToggleFollowProject}
        variant="contained"
        color={isUserFollowing ? "secondary" : "primary"}
        disabled={followingChangePending}
      >
        {followingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
        {isUserFollowing ? "Following" : "Follow"}
      </Button>
      {project.number_of_followers > 0 && (
        <Link
          color="secondary"
          underline="always"
          className={classes.followersLink}
          onClick={toggleShowFollowers}
        >
          <Typography className={classes.followersText}>
            <span className={classes.followerNumber}>{project.number_of_followers}</span> Follower
            {project.number_of_followers > 1 && "s"}
          </Typography>
        </Link>
      )}
    </span>
  );
}

const getFollowers = async (project, token) => {
  try {
    const resp = await Axios.get(
      process.env.API_URL + "/api/projects/" + project.url_slug + "/followers/",
      tokenConfig(token)
    );
    return resp.data.results;
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
  }
};
