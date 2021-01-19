import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: (props) => ({
    display: "none",
    backgroundImage:
      "url(/icons/small-cloud-" + props.type + (props.light ? "-light" : "") + ".svg)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    height: 50,
    width: 85,
    transform: props.reverse ? "scaleX(-1)" : "auto",
  }),
}));

export default function SmallCloud({ className, type, reverse, light }) {
  const classes = useStyles({ type: type, reverse: reverse, light: light });
  return <span className={`${className} ${classes.root}`} />;
}
