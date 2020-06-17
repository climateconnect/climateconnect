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
    }
  };
});

export default function MiniProfilePreview({ profile, avatarClassName }) {
  const classes = useStyles();
  return (
    <Link href={"/profiles/" + profile.url_slug} className={classes.avatarWithInfo}>
      <div className={classes.avatarWrapper}>
        <Avatar src={profile.image} className={avatarClassName} />
      </div>
      <Typography className={classes.profileName} variant="h6">
        {profile.first_name+" "+profile.last_name}
      </Typography>
    </Link>
  );
}
