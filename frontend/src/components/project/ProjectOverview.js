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
import LikeButton from "./Buttons/LikeButton";

const useStyles = makeStyles((theme) => ({
  ...projectOverviewStyles(theme),
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
  handleToggleLikeProject,
  isUserFollowing,
  isUserLiking,
  followingChangePending,
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
}) {
  const classes = useStyles();

  const texts = getTexts({ page: "project", locale: locale, project: project });

  return (
    <Container className={classes.projectOverview}>
      {smallScreen ? (
        <SmallScreenOverview project={project} texts={texts} />
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

function SmallScreenOverview({ project, texts }) {
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
            <LikeButton
              texts={texts}
              isUserLiking={isUserLiking}
              handleToggleLikeProject={handleToggleLikeProject}
              project={project}
              likes={likes}
              toggleShowLikes={toggleShowLikes}
            />
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
              <ContactCreatorButton
                projectAdmin={projectAdmin}
                contactProjectCreatorButtonRef={contactProjectCreatorButtonRef}
                handleClickContact={handleClickContact}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
