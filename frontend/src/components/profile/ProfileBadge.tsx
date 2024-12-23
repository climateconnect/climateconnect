import { Badge, Link, Theme, Tooltip } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import UserContext from "../context/UserContext";

const useStyles = makeStyles<Theme, { size: string; image?: string }>((theme) => ({
  badgeRoot: (props) => ({
    left: props.size === "small" ? "10%" : props.size === "medium" ? "10%" : "20%",
    bottom: props.size === "small" ? "10%" : props.size === "medium" ? "10%" : "10%",
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

type Props = React.PropsWithChildren<{ className?: string; badge?; size?; contentOnly?: boolean }>;
export default function ProfileBadge({ className, badge, children, size, contentOnly }: Props) {
  // deactivated donorforest badge for now
  // as the donorforest is not up to date
  badge.is_donorforest_badge = false;

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
      overlap="circular"
    >
      {children}
    </Badge>
  );
}

const BadgeContent = ({ badge, size, className, withLink }: any) => {
  const { locale } = useContext(UserContext);
  return (
    <Tooltip title={badge.name}>
      <div>
        {/* disabled Link to donorforest for now */}
        {withLink && false ? (
          <Link href={`${getLocalePrefix(locale)}/donorforest`} target="_blank" underline="hover">
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
