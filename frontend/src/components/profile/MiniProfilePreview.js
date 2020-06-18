import React from "react";
import { Link, Avatar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    avatarWrapper: {
      display: "inline-block",
      verticalAlign: "middle"
    },
    profileName: {
      display: "inline-block",
      verticalAlign: "middle",
      marginLeft: theme.spacing(1)
    },
    smallProfileName: {
      fontSize: 14
    }
  };
});

export default function MiniProfilePreview({ profile, avatarClassName, onProjectCard }) {
  const classes = useStyles();
  return (
    <Link color="inherit" href={"/profiles/" + profile.url_slug} className={classes.avatarWithInfo}>
      <div className={classes.avatarWrapper}>
        <Avatar src={profile.image} className={avatarClassName} />
      </div>
      <Typography
        color="inherit"
        className={`${classes.profileName} ${onProjectCard && classes.smallProfileName}`}
        variant="h6"
      >
        {profile.first_name + " " + profile.last_name}
      </Typography>
    </Link>
  );
}
