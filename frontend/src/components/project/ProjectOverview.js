import React from "react";
import { Container, Typography, Button, Tooltip, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlaceIcon from "@material-ui/icons/Place";
import ExploreIcon from "@material-ui/icons/Explore";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import MessageContent from "../communication/MessageContent";
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
import LanguageIcon from "@material-ui/icons/Language";
import Linkify from "react-linkify";
import Cookies from "universal-cookie";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import Router from "next/router";

const useStyles = makeStyles(theme => ({
  ...projectOverviewStyles(theme),
  contactProjectButton: {
    marginLeft: theme.spacing(1)
  },
  followButtonContainer: {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center"
  }
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
  isUserFollowing
}) {
  const classes = useStyles();
  const cookies = new Cookies();
  const handleClickContact = async event => {
    event.preventDefault();
    const creator = project.team.filter(m => m.permission === "Creator")[0];
    const chat = await startPrivateChat(creator, cookies.get("token"));
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  return (
    <Container className={classes.projectOverview}>
      {smallScreen ? (
        <SmallScreenOverview
          project={project}
          handleToggleFollowProject={handleToggleFollowProject}
          isUserFollowing={isUserFollowing}
          handleClickContact={handleClickContact}
        />
      ) : (
        <LargeScreenOverview
          project={project}
          handleToggleFollowProject={handleToggleFollowProject}
          isUserFollowing={isUserFollowing}
          handleClickContact={handleClickContact}
        />
      )}
    </Container>
  );
}

function SmallScreenOverview({
  project,
  handleToggleFollowProject,
  isUserFollowing,
  handleClickContact
}) {
  const classes = useStyles();
  return (
    <>
      <img className={classes.fullWidthImage} src={getImageUrl(project.image)} />
      <div className={classes.blockProjectInfo}>
        <Typography component="h1" variant="h3" className={classes.smallScreenHeader}>
          {project.name}
        </Typography>

        <Typography>{project.shortdescription}</Typography>
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
          />
          <Button
            className={classes.contactProjectButton}
            variant="contained"
            color="primary"
            onClick={handleClickContact}
          >
            Contact
          </Button>
        </div>
      </div>
    </>
  );
}

function LargeScreenOverview({
  project,
  handleToggleFollowProject,
  isUserFollowing,
  handleClickContact
}) {
  const classes = useStyles();
  return (
    <>
      <Typography component="h1" variant="h4" className={classes.largeScreenHeader}>
        {project.name}
      </Typography>
      <div className={classes.flexContainer}>
        <img className={classes.inlineImage} src={getImageUrl(project.image)} />
        <div className={classes.inlineProjectInfo}>
          <Typography component="h2" variant="h5" className={classes.subHeader}>
            Summary
          </Typography>
          <Typography component="div">
            <MessageContent content={project.shortdescription} />
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
            />
            <Button
              className={classes.contactProjectButton}
              variant="contained"
              color="primary"
              onClick={handleClickContact}
            >
              Contact organizer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function FollowButton({ project, isUserFollowing, handleToggleFollowProject }) {
  const classes = useStyles();
  return (
    <span className={classes.followButtonContainer}>
      <Button
        onClick={handleToggleFollowProject}
        variant="contained"
        color={isUserFollowing ? "secondary" : "primary"}
      >
        {isUserFollowing ? "Following" : "Follow"}
      </Button>
      {project.number_of_followers > 0 && (
        <Typography>
          {project.number_of_followers} follower{project.number_of_followers > 1 && "s"}
        </Typography>
      )}
    </span>
  );
}
