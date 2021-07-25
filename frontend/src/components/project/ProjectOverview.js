import { Button, CircularProgress, Container, Link, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EmailIcon from "@material-ui/icons/Email";
import ExploreIcon from "@material-ui/icons/Explore";
import LanguageIcon from "@material-ui/icons/Language";
import PlaceIcon from "@material-ui/icons/Place";
import Router from "next/router";
import React, { useContext, useEffect } from "react";
import Linkify from "react-linkify";
import Cookies from "universal-cookie";
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
  contactProjectCreatorButtonRef,
}) {
  const classes = useStyles();
  const cookies = new Cookies();
  const { user, notifications, setNotificationsRead, refreshNotifications, locale } = useContext(
    UserContext
  );
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
  const user_permission =
    user && project.team && project.team.find((m) => m.id === user.id)
      ? project.team.find((m) => m.id === user.id).permission
      : null;
  const hasAdminPermissions =
    user_permission && [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(user_permission);

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
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          texts={texts}
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
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          texts={texts}
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
  contactProjectCreatorButtonRef,
  texts,
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
  contactProjectCreatorButtonRef,
  texts,
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
            <FollowButton
              isUserFollowing={isUserFollowing}
              handleToggleFollowProject={handleToggleFollowProject}
              project={project}
              hasAdminPermissions={hasAdminPermissions}
              toggleShowFollowers={toggleShowFollowers}
              followingChangePending={followingChangePending}
              texts={texts}
            />

            <Button color="primary">Join +</Button>
            {/* <Button>Join +</Button> */}

            {/* TODO: add "view followers here" */}
            {/* TODO: add "6 people request to join here. View requestors?" */}
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
        variant="contained"
        color={isUserFollowing ? "secondary" : "primary"}
        disabled={followingChangePending}
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
