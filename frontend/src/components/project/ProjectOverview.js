import { Button, Container, Link, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExploreIcon from "@material-ui/icons/Explore";
import LanguageIcon from "@material-ui/icons/Language";
import Linkify from "react-linkify";
import PlaceIcon from "@material-ui/icons/Place";
import React, { useEffect, useState } from "react";

// Relative imports
import { apiRequest } from "../../../public/lib/apiOperations";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import { getParams } from "../../../public/lib/generalOperations";
import ContactCreatorButton from "./Buttons/ContactCreatorButton";
import FollowButton from "./Buttons/FollowButton";
import getTexts from "../../../public/texts/texts";
import GoBackFromProjectPageButton from "./Buttons/GoBackFromProjectPageButton";
import LikeButton from "./Buttons/LikeButton";
import MessageContent from "../communication/MessageContent";
import ProjectFollowersDialog from "../dialogs/ProjectFollowersDialog";
import ProjectLikesDialog from "../dialogs/ProjectLikesDialog";
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
import SocialMediaShareButton from "../shareContent/SocialMediaShareButton";

const useStyles = makeStyles((theme) => ({
  ...projectOverviewStyles(theme),
  infoBottomBar: (props) => ({
    display: "flex",
    marginTop: theme.spacing(3),
    justifyContent: props.hasAdminPermissions ? "flex-start" : "space-between",
  }),
  largeScreenButtonContainer: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
  },
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
    marginTop: theme.spacing(3),
    justifyContent: "flex-start",
    cursor: "pointer",
    marginRight: theme.spacing(1),
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
  headerButton: {
    right: 0,
    position: "absolute",
  },

  headerContainer: {
    display: "flex",
    justifyContent: "center",
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
  contactProjectButtonLarge: {
    height: 40,
    minWidth: 120,
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
  apiEndpointShareButton,
  contactProjectCreatorButtonRef,
  dialogTitleShareButton,
  followers,
  followingChangePending,
  handleClickContact,
  handleToggleFollowProject,
  handleToggleLikeProject,
  hasAdminPermissions,
  initiallyCaughtFollowers,
  initiallyCaughtLikes,
  isUserFollowing,
  isUserLiking,
  likes,
  likingChangePending,
  locale,
  mailBodyShareButton,
  messageTitleShareButton,
  numberOfFollowers,
  numberOfLikes,
  project,
  projectAdmin,
  projectLinkPath,
  screenSize,
  showFollowers,
  showLikes,
  toggleShowFollowers,
  toggleShowLikes,
  token,
  user,
  handleSetRequestedToJoinProject,
  requestedToJoinProject,
}) {
  const classes = useStyles();

  const texts = getTexts({ page: "project", locale: locale, project: project });
  /**
   * Calls endpoint to return a current list
   * of users that have requested to
   * join a specific project (i.e. requested membership).
   *
   * Note that the response includes a list of requests
   * (with corresponding request ID), and the users themselves.
   */
  async function getMembershipRequests(url_slug) {
    const resp = await apiRequest({
      method: "get",
      url: `/api/projects/${url_slug}/requesters/`,
    });

    if (!resp?.data?.results) {
      // TODO: error appropriately here
    }

    const requestedMembers = resp.data.results;

    // Now update the state, and thus button state,
    // if the current user has already requested to join the project,
    // based on results from the backend.
    const members = requestedMembers.filter((m) => m.user_profile.url_slug === user.url_slug);
    if (members.length > 0) {
      handleSetRequestedToJoinProject(true);
    }

    // TODO: we should probably have an associated timestamp with each request too.
    return requestedMembers;
  }

  const [gotParams, setGotParams] = useState(false);
  useEffect(() => {
    if (!gotParams) {
      const params = getParams(window.location.href);
      if (params.show_followers && !showFollowers) {
        toggleShowFollowers();
      }
      setGotParams(true);
    }

    // For non-creators, call the list of current requesters for this project,
    // so that we can update the state of the button as "Requested"
    // for the user.

    if (!hasAdminPermissions && !requestedToJoinProject) {
      getMembershipRequests(project.url_slug);
    }
  }, []);

  return (
    <Container className={classes.projectOverview}>
      {screenSize?.belowSmall ? (
        <SmallScreenOverview
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          followingChangePending={followingChangePending}
          handleClickContact={handleClickContact}
          handleToggleFollowProject={handleToggleFollowProject}
          hasAdminPermissions={hasAdminPermissions}
          isUserFollowing={isUserFollowing}
          project={project}
          texts={texts}
          toggleShowFollowers={toggleShowFollowers}
          numberOfFollowers={numberOfFollowers}
        />
      ) : (
        <LargeScreenOverview
          apiEndpointShareButton={apiEndpointShareButton}
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          dialogTitleShareButton={dialogTitleShareButton}
          followingChangePending={followingChangePending}
          handleClickContact={handleClickContact}
          handleToggleFollowProject={handleToggleFollowProject}
          handleToggleLikeProject={handleToggleLikeProject}
          hasAdminPermissions={hasAdminPermissions}
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
          texts={texts}
          toggleShowFollowers={toggleShowFollowers}
          toggleShowLikes={toggleShowLikes}
          token={token}
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

function SmallScreenOverview({
  apiEndpointShareButton,
  contactProjectCreatorButtonRef,
  dialogTitleShareButton,
  followingChangePending,
  handleClickContact,
  handleToggleFollowProject,
  hasAdminPermissions,
  isUserFollowing,
  locale,
  mailBodyShareButton,
  messageTitleShareButton,
  project,
  projectLinkPath,
  screenSize,
  texts,
  toggleShowFollowers,
  token,
  numberOfFollowers,
}) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.imageContainer}>
        {screenSize?.belowTiny && (
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
          tinyScreen={screenSize?.belowTiny}
          smallScreen={screenSize?.belowSmall}
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
        <div className={classes.infoBottomBar}>
          <FollowButton
            isUserFollowing={isUserFollowing}
            handleToggleFollowProject={handleToggleFollowProject}
            project={project}
            hasAdminPermissions={hasAdminPermissions}
            toggleShowFollowers={toggleShowFollowers}
            followingChangePending={followingChangePending}
            numberOfFollowers={numberOfFollowers}
            texts={texts}
            showStartIcon
            showNumberInText
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
  contactProjectCreatorButtonRef,
  followingChangePending,
  handleClickContact,
  handleToggleFollowProject,
  handleToggleLikeProject,
  hasAdminPermissions,
  isUserFollowing,
  isUserLiking,
  likes,
  likingChangePending,
  numberOfFollowers,
  numberOfLikes,
  project,
  projectAdmin,
  screenSize,
  texts,
  toggleShowFollowers,
  toggleShowLikes,
}) {
  const classes = useStyles({ hasAdminPermissions: hasAdminPermissions });

  return (
    <>
      <div className={classes.headerContainer}>
        <Typography component="h1" variant="h4" className={classes.largeScreenHeader}>
          {project.name}
        </Typography>
      </div>
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
            <FollowButton
              followingChangePending={followingChangePending}
              handleToggleFollowProject={handleToggleFollowProject}
              hasAdminPermissions={hasAdminPermissions}
              isUserFollowing={isUserFollowing}
              numberOfFollowers={numberOfFollowers}
              project={project}
              screenSize={screenSize}
              texts={texts}
              toggleShowFollowers={toggleShowFollowers}
              showStartIcon={!screenSize.belowMedium}
              showLinkUnderButton
            />
            {!hasAdminPermissions &&
              (!screenSize.belowMedium ? (
                <ContactCreatorButton
                  creator={projectAdmin}
                  contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
                  handleClickContact={handleClickContact}
                  customCardWidth={220}
                  withInfoCard={true}
                  withIcons={true}
                  collapsable={true}
                />
              ) : (
                <Button
                  className={classes.contactProjectButtonLarge}
                  variant="contained"
                  color="primary"
                  onClick={handleClickContact}
                  ref={contactProjectCreatorButtonRef}
                >
                  {texts.contact}
                </Button>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
