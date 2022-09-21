import { Button, CircularProgress, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import ButtonIcon from "./ButtonIcon";

const useStyles = makeStyles((theme) => ({
  followButtonContainer: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
  },
  followersLink: {
    cursor: "pointer",
    textAlign: "center",
  },
  followerNumber: {
    fontWeight: 700,
    color: theme.palette.secondary.main,
  },
  followersText: {
    fontWeight: 500,
    fontSize: 18,
    color: theme.palette.secondary.light,
  },
  followingButton: (props) => ({
    marginLeft: props.hasAdminPermissions ? theme.spacing(2) : theme.spacing(0.25),
    marginRight: props.hasAdminPermissions ? theme.spacing(2) : theme.spacing(0.25),
    whiteSpace: "nowrap",
    height: 40,
    maxWidth: props.belowSmallScreen ? 180 : 140,
    "&:disabled": {
      color: "white",
      background: theme.palette.secondary.main,
    },
  }),
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
    visibility: props.followingChangePending ? "hidden" : "visible",
  }),
  hidden: {
    visibility: "hidden",
  },
}));

export default function FollowButton({
  isUserFollowing,
  handleToggleFollowProject,
  hasAdminPermissions,
  toggleShowFollowers,
  followingChangePending,
  texts,
  screenSize,
  numberOfFollowers,
  bindFollow,
  showStartIcon,
  showLinkUnderButton,
  showNumberInText,
}) {
  const classes = useStyles({
    hasAdminPermissions: hasAdminPermissions,
    followingChangePending: followingChangePending,
    belowSmallScreen: screenSize?.belowSmall,
  });
  return (
    <span className={classes.followButtonContainer}>
      <Button
        {...bindFollow}
        onClick={handleToggleFollowProject}
        variant="contained"
        startIcon={
          showStartIcon ? (
            <ButtonIcon icon="follow" size={27} color={isUserFollowing ? "earth" : "white"} />
          ) : (
            <></>
          )
        }
        color={isUserFollowing ? "secondary" : "primary"}
        disabled={followingChangePending}
        className={classes.followingButton}
      >
        <div className={classes.buttonLabel}>
          <CircularProgress
            size={20}
            className={`${classes.fabProgress} ${!followingChangePending && classes.hidden}`}
          />
          <div className={classes.buttonText}>
            {isUserFollowing ? texts.following : texts.follow}
            {showNumberInText && !followingChangePending && numberOfFollowers > 0
              ? " • " + numberOfFollowers
              : ""}
          </div>
        </div>
      </Button>
      {showLinkUnderButton && numberOfFollowers > 0 && (
        <LinkWithText
          numberOfFollowers={numberOfFollowers}
          texts={texts}
          toggleShowFollowers={toggleShowFollowers}
        />
      )}
    </span>
  );
}

function LinkWithText({ numberOfFollowers, texts, toggleShowFollowers }) {
  const classes = useStyles();
  return (
    <Link
      color="secondary"
      underline="none"
      className={classes.followersLink}
      onClick={toggleShowFollowers}
    >
      <Typography className={classes.followersText}>
        <span className={classes.followerNumber}>{numberOfFollowers} </span>
        {numberOfFollowers > 1 ? texts.followers : texts.follower}
      </Typography>
    </Link>
  );
}
