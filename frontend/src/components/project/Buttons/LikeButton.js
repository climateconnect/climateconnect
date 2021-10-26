import { Button, IconButton } from "@material-ui/core";
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
}));

export default function LikeButton({
  isUserLiking,
  handleToggleLikeProject,
  texts,
  smallScreen,
  tinyScreen,
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
      </span>
    );
  }
}
