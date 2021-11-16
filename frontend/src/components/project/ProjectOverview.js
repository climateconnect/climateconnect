import { Container, Link, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExploreIcon from "@material-ui/icons/Explore";
import LanguageIcon from "@material-ui/icons/Language";
import PlaceIcon from "@material-ui/icons/Place";
import React from "react";
import Linkify from "react-linkify";
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
import getTexts from "../../../public/texts/texts";
import MessageContent from "../communication/MessageContent";
import ProjectFollowersDialog from "../dialogs/ProjectFollowersDialog";
import ProjectLikesDialog from "../dialogs/ProjectLikesDialog";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import ContactCreatorButton from "./Buttons/ContactCreatorButton";
import FollowButton from "./Buttons/FollowButton";
import GoBackFromProjectPageButton from "./Buttons/GoBackFromProjectPageButton";
import LikeButton from "./Buttons/LikeButton";
import SocialMediaShareButton from "./Buttons/SocialMediaShareButton";

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
}) {
  const classes = useStyles();

  const texts = getTexts({ page: "project", locale: locale, project: project });

  return (
    <Container className={classes.projectOverview}>
      {screenSize.belowSmall ? (
        <SmallScreenOverview
          project={project}
          texts={texts}
          screenSize={screenSize}
          locale={locale}
        />
      ) : (
        <LargeScreenOverview
          project={project}
          handleToggleFollowProject={handleToggleFollowProject}
          handleToggleLikeProject={handleToggleLikeProject}
          isUserFollowing={isUserFollowing}
          isUserLiking={isUserLiking}
          handleClickContact={handleClickContact}
          hasAdminPermissions={hasAdminPermissions}
          toggleShowFollowers={toggleShowFollowers}
          followingChangePending={followingChangePending}
          contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
          texts={texts}
          projectAdmin={projectAdmin}
          likes={likes}
          toggleShowLikes={toggleShowLikes}
          likingChangePending={likingChangePending}
          screenSize={screenSize}
          numberOfLikes={numberOfLikes}
          numberOfFollowers={numberOfFollowers}
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

function SmallScreenOverview({ project, texts, screenSize, locale }) {
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
        <SocialMediaShareButton containerClassName={classes.shareButtonContainer} />
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
      </div>
    </>
  );
}

function LargeScreenOverview({
  project,
  handleToggleFollowProject,
  handleToggleLikeProject,
  isUserFollowing,
  isUserLiking,
  handleClickContact,
  hasAdminPermissions,
  toggleShowFollowers,
  followingChangePending,
  contactProjectCreatorButtonRef,
  texts,
  projectAdmin,
  likes,
  toggleShowLikes,
  likingChangePending,
  screenSize,
  numberOfLikes,
  numberOfFollowers,
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
              isUserFollowing={isUserFollowing}
              handleToggleFollowProject={handleToggleFollowProject}
              project={project}
              hasAdminPermissions={hasAdminPermissions}
              toggleShowFollowers={toggleShowFollowers}
              followingChangePending={followingChangePending}
              texts={texts}
              screenSize={screenSize}
              numberOfFollowers={numberOfFollowers}
            />
            {!hasAdminPermissions && (
              <ContactCreatorButton
                projectAdmin={projectAdmin}
                contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
                handleClickContact={handleClickContact}
                screenSize={screenSize}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
