import { makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles(() => ({
  root: (props) => ({
    display: !props.show && "none",
    backgroundImage:
      "url(/icons/small-cloud-" +
      props.type +
      (props.light ? "-light" : props.white ? "-white" : "") +
      ".svg)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    height: 50,
    width: 85,
    transform: props.reverse ? "scaleX(-1)" : "auto",
  }),
}));

export default function SmallCloud({ className, type, reverse, light, show, white }) {
  const classes = useStyles({
    type: type,
    reverse: reverse,
    light: light,
    white: white,
    show: show,
  });
  return <span className={`${className} ${classes.root}`} />;
}
