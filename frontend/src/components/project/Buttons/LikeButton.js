import { Button, CircularProgress, IconButton, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import ButtonIcon from "./ButtonIcon";

const useStyles = makeStyles((theme) => ({
  largeScreenButtonContainer: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
  },
  likesLink: {
    cursor: "pointer",
    textAlign: "center",
  },
  largeLikeButton: {
    height: 40,
    maxWidth: 120,
    "&:disabled": {
      color: "white",
      background: theme.palette.secondary.main,
    },
  },
  likeNumber: {
    fontWeight: 700,
    color: theme.palette.secondary.main,
  },
  likeNumberMobile: {
    fontWeight: 600,
    color: theme.palette.primary.main,
    whiteSpace: "nowrap",
  },
  likesText: {
    fontWeight: 500,
    fontSize: 18,
    color: theme.palette.secondary.light,
  },
  mediumScreenIconButton: {
    height: 40,
  },
  mobileButtonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    cursor: "pointer",
    height: 40,
  },
  iconButton: {
    padding: theme.spacing(1),
    "&:hover": {
      background: "none",
    },
  },
  fabProgress: {
    color: "white",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "auto",
    marginBottom: "auto",
  },
  buttonLabel: {
    position: "relative",
  },
  buttonText: (props) => ({
    visibility: props.likingChangePending ? "hidden" : "visible",
  }),
  hidden: {
    visibility: "hidden",
  },
}));

export default function LikeButton({
  isUserLiking,
  handleToggleLikeProject,
  texts,
  toggleShowLikes,
  likingChangePending,
  hasAdminPermissions,
  screenSize,
  numberOfLikes,
  bindLike,
}) {
  const classes = useStyles({ likingChangePending: likingChangePending });

  if (screenSize.belowSmall) {
    return (
      <span
        className={classes.mobileButtonContainer}
        onClick={handleToggleLikeProject}
        {...bindLike}
      >
        <IconButton
          className={classes.iconButton}
          color={isUserLiking ? "secondary" : "primary"}
          disabled={likingChangePending}
        >
          <ButtonIcon icon="like" size={40} color={isUserLiking ? "earth" : "primary"} />
        </IconButton>
        {numberOfLikes > 0 && (
          <Typography className={classes.likeNumberMobile}>• {numberOfLikes}</Typography>
        )}
      </span>
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
          <ButtonIcon icon="like" size={40} color={isUserLiking ? "earth" : "primary"} />
        </IconButton>
        {numberOfLikes > 0 && (
          <Link
            color="secondary"
            className={classes.likesLink}
            underline="none"
            onClick={toggleShowLikes}
          >
            <Typography className={classes.likesText}>
              <span className={classes.likeNumber}>{numberOfLikes} </span>
              {numberOfLikes > 1 ? texts.likes : texts.one_like}
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
          startIcon={<ButtonIcon icon="like" size={26} color={isUserLiking ? "earth" : "white"} />}
          color={isUserLiking ? "secondary" : "primary"}
          disabled={likingChangePending}
          className={classes.largeLikeButton}
        >
          <div className={classes.buttonLabel}>
            <CircularProgress
              size={20}
              className={`${classes.fabProgress} ${!likingChangePending && classes.hidden}`}
            />
            <div className={classes.buttonText}>{isUserLiking ? texts.liked : texts.like}</div>
          </div>
        </Button>
        {numberOfLikes > 0 && (
          <Link
            color="secondary"
            className={classes.likesLink}
            underline="none"
            onClick={toggleShowLikes}
          >
            <Typography className={classes.likesText}>
              <span className={classes.likeNumber}>{numberOfLikes} </span>
              {numberOfLikes > 1 ? texts.likes : texts.one_like}
            </Typography>
          </Link>
        )}
      </span>
    );
  }
}
