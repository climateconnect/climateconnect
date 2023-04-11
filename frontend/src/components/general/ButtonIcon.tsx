import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles(() => ({
  icon: (props) => ({
    height: props.size,
  }),
}));

export default function ButtonIcon({ icon, color, size }) {
  const classes = useStyles({ size });

  if (icon === "like") {
    if (color === "white") {
      return <img className={classes.icon} src={"/images/like-white.svg"} />;
    }
    if (color === "earth") {
      return <img className={classes.icon} src={"/images/like-planet-earth.svg"} />;
    }
    if (color === "primary") {
      return <img className={classes.icon} src={"/images/like-primary.svg"} />;
    }
  }
  if (icon === "follow") {
    if (color === "white") {
      return <img className={classes.icon} src={"/images/follow-white.svg"} />;
    }
    if (color === "earth") {
      return <img className={classes.icon} src={"/images/follow-planet-earth.svg"} />;
    }
  }
}
