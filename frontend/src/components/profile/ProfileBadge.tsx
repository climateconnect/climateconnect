import { Badge, Link, makeStyles, Tooltip } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  badgeRoot: (props) => ({
    left: props.size === "small" ? "10%" : props.size === "medium" ? "10%" : "20%",
    bottom: props.size === "small" ? "10%" : props.size === "medium" ? "10%" : "40%",
  }),
  badgeContainer: {
    background: "white",
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: "100%",
  },
  badgeContent: (props) => ({
    height: props.size === "small" ? 15 : props.size === "medium" ? 25 : 55,
    width: props.size === "small" ? 15 : props.size === "medium" ? 25 : 55,
    background: `url(${props.image})`,
    backgroundRepeat: "no-repeat",
    backgroundPositionY: "center",
    backgroundPositionX: "center",
    backgroundSize: props.size === "small" ? 11 : props.size === "medium" ? 15 : 48,
  }),
}));

export default function ProfileBadge({ className, badge, children, size, contentOnly }) {
  const classes = useStyles({ image: getImageUrl(badge.image), size: size });
  if (contentOnly) {
    return <BadgeContent badge={badge} size={size} className={className} />;
  }

  return (
    <Badge
      classes={{
        badge: `${classes.badgeRoot} ${className}`,
      }}
      badgeContent={
        <BadgeContent badge={badge} size={size} withLink={badge.is_donorforest_badge} />
      }
      anchorOrigin={{
        horizontal: "left",
        vertical: "bottom",
      }}
      overlap="circle"
    >
      {children}
    </Badge>
  );
}

const BadgeContent = ({ badge, size, className, withLink }) => {
  const { locale } = useContext(UserContext);
  return (
    <Tooltip title={badge.name}>
      <div>
        {withLink ? (
          <Link href={`${getLocalePrefix(locale)}/donorforest`} target="_blank">
            <Content badge={badge} size={size} className={className} />
          </Link>
        ) : (
          <Content badge={badge} size={size} className={className} />
        )}
      </div>
    </Tooltip>
  );
};

const Content = ({ badge, size, className }) => {
  const classes = useStyles({ image: getImageUrl(badge.image), size: size });
  return (
    <div className={`${badge.is_donorforest_badge && classes.badgeContainer} ${className}`}>
      <div className={classes.badgeContent} />
    </div>
  );
};
