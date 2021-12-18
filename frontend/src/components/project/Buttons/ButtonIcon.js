import { makeStyles } from "@material-ui/core/styles";
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
      return <img className={classes.icon} src={"/images/like-white.svg"} loading="lazy" />;
    }
    if (color === "earth") {
      return <img className={classes.icon} src={"/images/like-planet-earth.svg"} loading="lazy" />;
    }
    if (color === "primary") {
      return <img className={classes.icon} src={"/images/like-primary.svg"} loading="lazy" />;
    }
  }
  if (icon === "follow") {
    if (color === "white") {
      return <img className={classes.icon} src={"/images/follow-white.svg"} loading="lazy" />;
    }
    if (color === "earth") {
      return (
        <img className={classes.icon} src={"/images/follow-planet-earth.svg"} loading="lazy" />
      );
    }
  }
}
