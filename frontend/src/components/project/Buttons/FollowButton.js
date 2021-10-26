import { Button, CircularProgress, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Person } from "@material-ui/icons";
import React from "react";

const useStyles = makeStyles((theme) => ({
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
  followingButton: {
    whiteSpace: "nowrap",
    height: 40,
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
  },
}));

export default function FollowButton({
  project,
  isUserFollowing,
  handleToggleFollowProject,
  hasAdminPermissions,
  toggleShowFollowers,
  followingChangePending,
  texts,
  smallScreen,
  tinyScreen,
}) {
  const classes = useStyles({ hasAdminPermissions: hasAdminPermissions });
  if (smallScreen) {
    return (
      <Button
        onClick={handleToggleFollowProject}
        variant="contained"
        startIcon={<Person />}
        color={isUserFollowing ? "secondary" : "primary"}
        disabled={followingChangePending}
        className={classes.followingButton}
      >
        {followingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
        {isUserFollowing ? texts.following : texts.follow}
      </Button>
    );
  } else if (tinyScreen) {
    return (
      <Button
        onClick={handleToggleFollowProject}
        variant="contained"
        color={isUserFollowing ? "secondary" : "primary"}
        disabled={followingChangePending}
        className={classes.followingButton}
      >
        {followingChangePending && <CircularProgress size={13} className={classes.fabProgress} />}
        {isUserFollowing ? texts.following : texts.follow}
      </Button>
    );
  } else {
    return (
      <span className={classes.followButtonContainer}>
        <Button
          onClick={handleToggleFollowProject}
          variant="contained"
          startIcon={<Person />}
          color={isUserFollowing ? "secondary" : "primary"}
          disabled={followingChangePending}
          className={classes.followingButton}
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
}
