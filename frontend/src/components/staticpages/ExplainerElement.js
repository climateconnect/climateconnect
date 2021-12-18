import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  explainerElementWrapper: (props) => ({
    display: "flex",
    flexDirection: props.horizontal ? "line" : "column",
    justifyContent: props.horizontal ? "center" : "auto",
    alignItems: "center",
    textAlign: props.horizontal ? "auto" : "center",
    maxWidth: props.horizontal ? 330 : 300,
    position: "relative",
  }),
  explainerIcon: (props) => ({
    maxWidth: 50,
    marginBottom: props.horizontal ? 0 : theme.spacing(2),
    marginRight: props.horizontal ? theme.spacing(5) : 0,
  }),
}));

export default function ExplainerElement({ icon, text, children, alt, horizontal }) {
  const classes = useStyles({ horizontal: horizontal });
  return (
    <div className={classes.explainerElementWrapper}>
      {children}
      <img src={icon} className={classes.explainerIcon} alt={alt} loading="lazy" />
      <Typography>{text}</Typography>
    </div>
  );
}
