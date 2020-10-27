import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: props => ({
    backgroundImage:
      "url(/icons/small-cloud-" + props.type + (props.light ? "-light" : "") + ".svg)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    height: 50,
    width: 85,
    transform: props.reverse ? "scaleX(-1)" : "auto"
  })
}));

export default function SmallCloud({ className, type, reverse, light }) {
  const classes = useStyles({ type: type, reverse: reverse, light: light });
  console.log("url(/icons/small-cloud-" + type + (light ? "-light" : "") + ".svg))");
  return <span className={`${className} ${classes.root}`} />;
}
