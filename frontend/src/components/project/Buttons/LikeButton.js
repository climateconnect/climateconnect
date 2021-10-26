import { Button, IconButton, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import LikeIcon from "./LikeIcon";

const useStyles = makeStyles((theme) => ({
  largeLikeButtonContainer: {
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
  },
  largeLikeButton: {
    height: 40,
  },
  likesLink: {
    cursor: "pointer",
    textAlign: "center",
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
}));

export default function LikeButton({
  isUserLiking,
  handleToggleLikeProject,
  texts,
  smallScreen,
  tinyScreen,
  project,
  toggleShowLikes,
}) {
  const classes = useStyles({});
  if (smallScreen) {
    return (
      <IconButton onClick={handleToggleLikeProject} color={isUserLiking ? "secondary" : "primary"}>
        <LikeIcon size={30} color={isUserLiking ? "earth" : "primary"} />
      </IconButton>
    );
  } else if (tinyScreen) {
    return (
      <IconButton onClick={handleToggleLikeProject} color={isUserLiking ? "secondary" : "primary"}>
        <LikeIcon size={30} color={isUserLiking ? "earth" : "primary"} />
      </IconButton>
    );
  } else {
    return (
      <span className={classes.largeLikeButtonContainer}>
        <Button
          onClick={handleToggleLikeProject}
          variant="contained"
          startIcon={<LikeIcon size={20} color={isUserLiking ? "earth" : "white"} />}
          color={isUserLiking ? "secondary" : "primary"}
          className={classes.largeLikeButton}
        >
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
