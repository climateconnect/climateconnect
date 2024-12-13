import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import LikeIcon from "../../../public/images/like-white.svg";
import FollowIcon from "../../../public/images/follow-white.svg";
const useStyles = makeStyles(() => ({
  icon: (props) => ({
    height: props.size,
  }),
  color: (props) => ({
    fill: props.color,
  }),
}));

export default function ButtonIcon({ icon, color, size }) {
  const classes = useStyles({ size, color });

  if (icon === "like") {
    if (color === "earth") {
      return <img className={classes.icon} src={"/images/like-planet-earth.svg"} />;
    }
    if (color !== "earth") {
      return <LikeIcon className={`${classes.icon} ${classes.color}`} />;
    }
  }
  if (icon === "follow") {
    if (color !== "earth") {
      return <FollowIcon className={`${classes.icon} ${classes.color}`} />;
    }
    if (color === "earth") {
      return <img className={classes.icon} src={"/images/follow-planet-earth.svg"} />;
    }
  }
}
