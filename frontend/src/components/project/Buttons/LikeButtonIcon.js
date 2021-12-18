import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(() => ({
  heartIcon: (props) => ({
    height: props.size,
  }),
}));

export default function LikeButtonIcon({ color, size }) {
  const classes = useStyles({ size });

  if (color === "white")
    return (
      <img className={classes.heartIcon} src={"/images/planet-earth-white.svg"} loading="lazy" />
    );
  if (color === "earth")
    return (
      <img className={classes.heartIcon} src={"/images/planet-earth-heart.svg"} loading="lazy" />
    );
  if (color === "primary")
    return (
      <img className={classes.heartIcon} src={"/images/planet-earth-primary.svg"} loading="lazy" />
    );
}
