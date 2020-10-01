import React from "react";
import { Link, Avatar, Typography, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import ClearIcon from "@material-ui/icons/Clear";

const useStyles = makeStyles(theme => {
  return {
    avatarWrapper: {
      display: "inline-block",
      verticalAlign: "middle"
    },
    profileName: {
      display: "inline-block",
      verticalAlign: "middle",
      marginLeft: theme.spacing(1),
      whiteSpace: "nowrap"
    },
    smallProfileName: {
      fontSize: 14
    },
    smallAvatar: {
      height: 20,
      width: 20
    },
    wrapper: {
      display: "inline-flex",
      alignItems: "center"
    }
  };
});

export default function MiniProfilePreview({
  className,
  profile,
  avatarClassName,
  size,
  nolink,
  onDelete
}) {
  const classes = useStyles();
  if (!nolink)
    return (
      <div className={classes.wrapper}>
        <Link
          color="inherit"
          href={"/profiles/" + profile.url_slug}
          className={`${classes.avatarWithInfo} ${className}`}
        >
          <Content profile={profile} avatarClassName={avatarClassName} size={size} />
        </Link>
        {onDelete && (
          <IconButton onClick={() => onDelete(profile)}>
            <ClearIcon />
          </IconButton>
        )}
      </div>
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
