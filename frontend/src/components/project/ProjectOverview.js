import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "universal-cookie";
import ExploreIcon from "@material-ui/icons/Explore";
import LanguageIcon from "@material-ui/icons/Language";
import Linkify from "react-linkify";
import PlaceIcon from "@material-ui/icons/Place";
import React, { useContext, useEffect, useState } from "react";
import Router from "next/router";

// Relative imports
import { apiRequest, redirect } from "../../../public/lib/apiOperations";
import ButtonIcon from "./Buttons/ButtonIcon";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import { getParams } from "../../../public/lib/generalOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import ContactCreatorButton from "./Buttons/ContactCreatorButton";
import FollowButton from "./Buttons/FollowButton";
import getTexts from "../../../public/texts/texts";
import GoBackFromProjectPageButton from "./Buttons/GoBackFromProjectPageButton";
import LikeButton from "./Buttons/LikeButton";
import JoinButton from "./Buttons/JoinButton";
import MessageContent from "../communication/MessageContent";
import ProjectFollowersDialog from "../dialogs/ProjectFollowersDialog";
import ProjectLikesDialog from "../dialogs/ProjectLikesDialog";
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
import RequestMembershipButton from "./RequestMembershipButton";
import ROLE_TYPES from "../../../public/data/role_types";
import SocialMediaShareButton from "../shareContent/SocialMediaShareButton";
import UserContext from "../context/UserContext";

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
}) {
  const classes = useStyles();
  const cookies = new Cookies();
  const { notifications, pathName, refreshNotifications, setNotificationsRead } = useContext(
    UserContext
  );

  const userPermission =
    user && project.team && project.team.find((m) => m.id === user.id)
      ? project.team.find((m) => m.id === user.id).permission
      : null;

  const [requestedToJoinProject, setRequestedToJoinProject] = useState(false);

  const texts = getTexts({ page: "project", locale: locale, project: project });

  /**
   * Calls backend, sending a request to join this project based
   * on user token stored in cookies.
   */
  const handleSendProjectJoinRequest = async (event) => {
    // Get the actual project name from the URL, removing any query params
    // and projects/ prefix. For example,
    // "/projects/Anotherproject6?projectId=Anotherproject6" -> "Anotherproject6"
    const projectName = pathName?.split("/")[2].split("?")[0];

    // Also strip any trailing '#' too.
    const strippedProjectName = projectName.endsWith("#") ? projectName.slice(0, -1) : projectName;

    const cookies = new Cookies();
    const token = cookies.get("token");

    try {
      const response = await apiRequest({
        method: "post",
        url: `/api/projects/${strippedProjectName}/request_membership/${user.url_slug}/`,
        payload: {
          message: "Would like to join the project!",
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

  // TODO(Piper): confirm this drop, and others that've moved into ProjectPageRoot
  // are desired before landing
  // const [followers, setFollowers] = useState([]);

  const [gotParams, setGotParams] = useState(false);
  useEffect(() => {
    if (!gotParams) {
      const params = getParams(window.location.href);
      if (params.show_followers && !showFollowers) toggleShowFollowers();
      setGotParams(true);
    }
  });

  // TODO(Piper): 1/29/22 - ensure that we don't send a join request
  // for projects we own / are admin of / creator of. Ensure that
  // we don't blindly make a call to request membership; should
  // check membership status *first*.
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
      {screenSize?.belowSmall ? (
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
          userPermission={userPermission}
        />
      ) : (
        <LargeScreenOverview
          apiEndpointShareButton={apiEndpointShareButton}
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          dialogTitleShareButton={dialogTitleShareButton}
          followingChangePending={followingChangePending}
          handleClickContact={handleClickContact}
          handleSendProjectJoinRequest={handleSendProjectJoinRequest}
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
          requestedToJoinProject={requestedToJoinProject}
          screenSize={screenSize}
          texts={texts}
          toggleShowFollowers={toggleShowFollowers}
          toggleShowLikes={toggleShowLikes}
          token={token}
          userPermission={userPermission}
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
  handleSendProjectJoinRequest,
  handleToggleFollowProject,
  hasAdminPermissions,
  isUserFollowing,
  locale,
  mailBodyShareButton,
  messageTitleShareButton,
  project,
  projectLinkPath,
  requestedToJoinProject,
  screenSize,
  texts,
  toggleShowFollowers,
  token,
  userPermission,
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
          {/* If the user is an admin on the project, or is already part
            of the project (has read only permissions), then we don't want to show the membership request button. */}
          {!hasAdminPermissions ||
            (userPermission && [ROLE_TYPES.read_only_type].includes(userPermission) && (
              <JoinButton
                handleSendProjectJoinRequest={handleSendProjectJoinRequest}
                requestedToJoin={requestedToJoinProject}
              />
            ))}

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
  contactProjectCreatorButtonRef,
  followingChangePending,
  handleClickContact,
  handleSendProjectJoinRequest,
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
  requestedToJoinProject,
  screenSize,
  texts,
  toggleShowFollowers,
  toggleShowLikes,
  userPermission,
}) {
  const classes = useStyles({ hasAdminPermissions: hasAdminPermissions });

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
            of the project (has read only permissions), then we don't want to show the membership request button. */}
            {!hasAdminPermissions ||
              (userPermission && [ROLE_TYPES.read_only_type].includes(userPermission) && (
                <JoinButton
                  handleSendProjectJoinRequest={handleSendProjectJoinRequest}
                  requestedToJoin={requestedToJoinProject}
                />
              ))}

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
