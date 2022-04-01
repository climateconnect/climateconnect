import { Avatar, IconButton, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ClearIcon from "@material-ui/icons/Clear";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import ProfileBadge from "./ProfileBadge";

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
    mediumProfileName: {
      fontSize: 16,
    },
    smallAvatar: {
      height: 20,
      width: 20,
    },
    mediumAvatar: {
      height: 30,
      width: 30,
    },
    wrapper: {
      display: "inline-flex",
      alignItems: "center",
    },
    contentWrapper: {
      display: "inline-flex",
      alignItems: "center",
    },
    badge: {
      bottom: "20%",
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

  const avatarProps = {
    src: getImageUrl(profile.thumbnail_image),
    className: `${size === "small" && classes.smallAvatar} ${
      size === "medium" && classes.mediumAvatar
    } ${avatarClassName}`,
  };

  return (
    <span className={classes.contentWrapper}>
      <div className={classes.avatarWrapper}>
        {profile.badges?.length > 0 ? (
          <ProfileBadge
            name={profile.badges[0].name}
            image={getImageUrl(profile.badges[0].image)}
            size={["medium", "small"].includes(size) ? "small" : "medium"}
            className={size === "medium" && classes.badge}
          >
            <Avatar {...avatarProps} />
          </ProfileBadge>
        ) : (
          <Avatar {...avatarProps} />
        )}
      </div>
      <Typography
        color="inherit"
        className={`${classes.profileName} ${size === "medium" && classes.mediumProfileName} ${
          size === "small" && classes.smallProfileName
        }`}
        variant="h6"
      >
        {profile.first_name + " " + profile.last_name}
      </Typography>
    </span>
  );
}
