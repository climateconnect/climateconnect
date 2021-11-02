import { Button, CircularProgress, IconButton, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import LikeIcon from "./LikeIcon";

const useStyles = makeStyles((theme) => ({
  largeScreenButtonContainer: (props) => ({
    display: "inline-flex",
    flexDirection: props.displayNextToButton,
    alignItems: "center",
  }),
  likesLink: (props) => ({
    cursor: "pointer",
    textAlign: "center",
    marginLeft: theme.spacing(props.addMarginLeft),
  }),
  largeLikeButton: {
    height: 40,
    maxWidth: 120,
  },
  likeNumber: {
    fontWeight: 700,
    color: theme.palette.secondary.main,
  },
  likesText: {
    fontWeight: 500,
    fontSize: 18,
    color: theme.palette.secondary.light,
  },
  mediumScreenIconButton: {
    height: 40,
  },
}));

export default function LikeButton({
  isUserLiking,
  handleToggleLikeProject,
  texts,
  project,
  toggleShowLikes,
  likingChangePending,
  hasAdminPermissions,
  screenSize,
}) {
  const classes = useStyles({
    displayNextToButton: hasAdminPermissions && !screenSize.belowMedium ? "row" : "column",
    addMarginLeft: hasAdminPermissions && !screenSize.belowMedium ? 1 : 0,
  });
  if (screenSize.belowSmall && !screenSize.belowTiny) {
    return (
      <IconButton
        onClick={handleToggleLikeProject}
        color={isUserLiking ? "secondary" : "primary"}
        disabled={likingChangePending}
      >
        <LikeIcon size={30} color={isUserLiking ? "earth" : "primary"} />
      </IconButton>
    );
  } else if (screenSize.belowTiny) {
    return (
      <IconButton
        onClick={handleToggleLikeProject}
        color={isUserLiking ? "secondary" : "primary"}
        disabled={likingChangePending}
      >
        <LikeIcon size={30} color={isUserLiking ? "earth" : "primary"} />
      </IconButton>
    );
  } else if (screenSize.belowMedium && !screenSize.belowSmall && !hasAdminPermissions) {
    return (
      <span className={classes.largeScreenButtonContainer}>
        <IconButton
          onClick={handleToggleLikeProject}
          color={isUserLiking ? "secondary" : "primary"}
          disabled={likingChangePending}
          className={classes.mediumScreenIconButton}
        >
          <LikeIcon size={30} color={isUserLiking ? "earth" : "primary"} />
        </IconButton>
        {project.number_of_likes > 0 && (
          <Link
            color="secondary"
            className={classes.likesLink}
            underline="none"
            onClick={toggleShowLikes}
          >
            <Typography className={classes.likesText}>
              <span className={classes.likeNumber}>{project.number_of_likes} </span>
              {project.number_of_likes > 1 ? texts.likes : texts.one_like}
            </Typography>
          </Link>
        )}
      </span>
    );
  } else {
    return (
      <span className={classes.largeScreenButtonContainer}>
        <Button
          onClick={handleToggleLikeProject}
          variant="contained"
          startIcon={<LikeIcon size={20} color={isUserLiking ? "earth" : "white"} />}
          color={isUserLiking ? "secondary" : "primary"}
          disabled={likingChangePending}
          className={classes.largeLikeButton}
        >
          {likingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
          {isUserLiking ? texts.liked : texts.like}
        </Button>
        {project.number_of_likes > 0 && (
          <Link
            color="secondary"
            className={classes.likesLink}
            underline="none"
            onClick={toggleShowLikes}
          >
            <Typography className={classes.likesText}>
              <span className={classes.likeNumber}>{project.number_of_likes} </span>
              {project.number_of_likes > 1 ? texts.likes : texts.one_like}
            </Typography>
          </Link>
        )}
      </span>
    );
  }
}
