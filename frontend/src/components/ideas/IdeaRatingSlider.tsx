import { Slider, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles<Theme, { averageRating: any }>((theme) => ({
  root: {
    color: theme.palette.primary.main,
    height: theme.spacing(1.75),
    paddingTop: 13,
    paddingBottom: 13,
  },
  thumb: {
    height: 40,
    width: 47,
    background: 'url("/images/planet-earth-heart.svg")',
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% auto",
    borderRadius: 0,
    zIndex: 1,
    ["&:hover"]: {
      boxShadow: "none",
    },
  },
  active: {
    boxShadow: "none !important",
  },
  focusVisible: {
    boxShadow: "none !important",
  },
  valueLabel: {
    left: theme.spacing(1),
  },
  rail: {
    height: theme.spacing(1.75),
    borderRadius: theme.spacing(1.75),
    backgroundColor: theme.palette.secondary.light,
    opacity: 0.25,
  },
  wrapper: {
    position: "relative",
  },
  averageRatingContainer: (props) => ({
    position: "absolute",
    top: 13,
    left: 0,
    height: theme.spacing(1.75),
    width: `${props.averageRating}%`,
    background: theme.palette.primary.main,
    borderRadius: theme.spacing(1.75),
  }),
  averageCharacter: {
    position: "absolute",
    top: -3,
    right: theme.spacing(0.5),
    color: "white",
    fontSize: 12,
  },
}));

export default function IdeaRatingSlider(props) {
  const classes = useStyles({ averageRating: props.averageRating });
  return (
    <div className={classes.wrapper}>
      <Slider {...props} classes={classes} size="small" />
      <div className={classes.averageRatingContainer}>
        <Typography className={classes.averageCharacter}>Ø</Typography>
      </div>
    </div>
  );
}
