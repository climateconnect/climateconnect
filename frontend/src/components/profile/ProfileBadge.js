import { Badge, Link, makeStyles, Tooltip } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
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
    height: props.size === "small" ? 15 : props.size === "medium" ? 25 : 50,
    width: props.size === "small" ? 15 : props.size === "medium" ? 25 : 50,
    background: `url(${props.image})`,
    backgroundRepeat: "no-repeat",
    backgroundPositionY: "center",
    backgroundPositionX: "center",
    backgroundSize: props.size === "small" ? 9 : props.size === "medium" ? 15 : 30,
  }),
}));

export default function ProfileBadge({ className, name, image, children, size, contentOnly }) {
  const classes = useStyles({ image: image, size: size });
  if (contentOnly) {
    return <BadgeContent name={name} image={image} size={size} className={className} />;
  }
  return (
    <Badge
      classes={{
        badge: `${classes.badgeRoot} ${className}`,
      }}
      badgeContent={<BadgeContent name={name} image={image} size={size} withLink />}
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

const BadgeContent = ({ name, image, size, className, withLink }) => {
  const { locale } = useContext(UserContext)
  return (
    <Tooltip title={name}>
      {withLink ? (
        <Link href={`${getLocalePrefix(locale)}/donorforest`} target="_blank">
          <Content 
            image={image}
            size={size}
            className={className}
          />
        </Link>
      ): (
        <Content 
          image={image}
          size={size}
          className={className}
        />
      )}
    </Tooltip>
  );
};

const Content = ({image, size, className}) => {
  const classes = useStyles({ image: image, size: size });
  return (
    <div className={`${classes.badgeContainer} ${className}`}>
      <div className={classes.badgeContent} />
    </div>
  )
}