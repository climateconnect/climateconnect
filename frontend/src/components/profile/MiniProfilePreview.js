import React from "react";
import { Link, Avatar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getImageUrl } from "./../../../public/lib/imageOperations";

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
    },
    smallAvatar: {
      height: 20,
      width: 20
    }
  };
});

export default function MiniProfilePreview({ className, profile, avatarClassName, size, nolink }) {
  const classes = useStyles();
  if (!nolink)
    return (
      <Link
        color="inherit"
        href={"/profiles/" + profile.url_slug}
        className={`${classes.avatarWithInfo} ${className}`}
      >
        <Content profile={profile} avatarClassName={avatarClassName} size={size} />
      </Link>
    );
  else
    return (
      <div className={`${classes.avatarWithInfo} ${className}`}>
        <Content profile={profile} avatarClassName={avatarClassName} size={size} />
      </div>
    );
}

function Content({ profile, avatarClassName, size }) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.avatarWrapper}>
        <Avatar
          src={getImageUrl(profile.image)}
          className={`${size === "small" && classes.smallAvatar} ${avatarClassName}`}
        />
      </div>
      <Typography
        color="inherit"
        className={`${classes.profileName} ${size === "small" && classes.smallProfileName}`}
        variant="h6"
      >
        {profile.first_name + " " + profile.last_name}
      </Typography>
    </>
  );
}
