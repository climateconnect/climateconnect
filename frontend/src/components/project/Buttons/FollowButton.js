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
    maxWidth: 140,
  }),
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
}) {
  const classes = useStyles({ hasAdminPermissions: hasAdminPermissions });
  if (screenSize.belowSmall && !screenSize.belowTiny) {
    return (
      <Button
        {...bindFollow}
        onClick={handleToggleFollowProject}
        variant="contained"
        startIcon={<ButtonIcon icon ="follow" size={30} color={isUserFollowing ? "earth" : "white"} />}
        color={isUserFollowing ? "secondary" : "primary"}
        disabled={followingChangePending}
        className={classes.followingButton}
      >
        {followingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
        {isUserFollowing ? texts.following : texts.follow}
        {numberOfFollowers > 0 ? " • " + numberOfFollowers : ""}
      </Button>
    );
  } else if (screenSize.belowTiny) {
    return (
      <Button
        {...bindFollow}
        onClick={handleToggleFollowProject}
        variant="contained"
        color={isUserFollowing ? "secondary" : "primary"}
        disabled={followingChangePending}
        className={classes.followingButton}
      >
        {followingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
        {isUserFollowing ? texts.following : texts.follow}
        {numberOfFollowers > 0 ? " • " + numberOfFollowers : ""}
      </Button>
    );
  } else {
    return (
      <span className={classes.followButtonContainer}>
        <Button
          onClick={handleToggleFollowProject}
          variant="contained"
          startIcon={<ButtonIcon icon ="follow" size={30} color={isUserFollowing ? "earth" : "white"} />}
          color={isUserFollowing ? "secondary" : "primary"}
          disabled={followingChangePending}
          className={classes.followingButton}
        >
          {followingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
          {isUserFollowing ? texts.following : texts.follow}
        </Button>
        {numberOfFollowers > 0 && (
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
        )}
      </span>
    );
  }
}
