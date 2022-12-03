import React from "react";
import { Avatar, Typography } from "@material-ui/core";
import GroupIcon from "@material-ui/icons/Group";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => {
  return {
    avatarWrapper: {
      display: "inline-block",
      verticalAlign: "middle",
    },
    profileName: {
      display: "inline-block",
      verticalAlign: "middle",
      marginLeft: theme.spacing(1),
    },
    mediumProfileName: {
      fontSize: 16,
    },

    mediumAvatar: {
      height: 30,
      width: 30,
    },
  };
});

export default function ChatTitle({ chat, className, size }) {
  const classes = useStyles();

  return (
    <div className={className}>
      <div className={classes.avatarWrapper}>
        <Avatar className={`${size == "medium" && classes.mediumAvatar}`}>
          <GroupIcon />
        </Avatar>
      </div>
      <Typography
        color="inherit"
        className={`${classes.profileName} ${size === "medium" && classes.mediumProfileName}`}
        variant="h6"
      >
        {chat.name}
      </Typography>
    </div>
  );
}
