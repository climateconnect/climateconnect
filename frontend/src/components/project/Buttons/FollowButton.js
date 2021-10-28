import { Button, CircularProgress, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Person } from "@material-ui/icons";
import React from "react";

const useStyles = makeStyles((theme) => ({
  followButtonContainer: (props) => ({
    display: "inline-flex",
    flexDirection: props.displayNextToButton,
    alignItems: "center",
  }),
  followersLink: (props) => ({
    cursor: "pointer",
    textAlign: "center",
    marginLeft: theme.spacing(props.addMarginLeft),
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
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
    whiteSpace: "nowrap",
    height: 40,
    maxWidth: 140,
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
  largeScreen,
}) {
  const classes = useStyles({
    displayNextToButton: hasAdminPermissions && largeScreen ? "row" : "column",
    addMarginLeft: hasAdminPermissions && largeScreen ? 1 : 0,
  });
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
            underline="none"
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
