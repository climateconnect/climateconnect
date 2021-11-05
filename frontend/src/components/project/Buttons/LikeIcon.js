import { makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles(() => ({
  heartIcon: (props) => ({
    height: props.size,
  }),
}));

export default function LikeIcon({ color, size }) {
  const classes = useStyles({ size });

  if (color === "white")
    return <img className={classes.heartIcon} src={"/images/planet-earth-white.svg"} />;
  if (color === "earth")
    return <img className={classes.heartIcon} src={"/images/planet-earth-heart.svg"} />;
  if (color === "primary")
    return <img className={classes.heartIcon} src={"/images/planet-earth-primary.svg"} />;
}
