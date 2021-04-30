import { Avatar, IconButton, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ClearIcon from "@material-ui/icons/Clear";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";
import { getImageUrl } from "./../../../public/lib/imageOperations";

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
      whiteSpace: "nowrap",
    },
    smallProfileName: {
      fontSize: 14,
    },
    smallAvatar: {
      height: 20,
      width: 20,
    },
    wrapper: {
      display: "inline-flex",
      alignItems: "center",
    },
    contentWrapper: {
      display: "inline-flex",
      alignItems: "center",
    },
  };
});

export default function MiniProfilePreview({
  className,
  profile,
  avatarClassName,
  size,
  nolink,
  onDelete,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  if (!nolink)
    return (
      <div className={classes.wrapper}>
        <Link
          color="inherit"
          href={getLocalePrefix(locale) + "/profiles/" + profile.url_slug}
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
    <span className={classes.contentWrapper}>
      <div className={classes.avatarWrapper}>
        <Avatar
          src={getImageUrl(profile.thumbnail_image)}
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
    </span>
  );
}
