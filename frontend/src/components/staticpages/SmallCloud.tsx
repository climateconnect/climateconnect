import { Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles<
  Theme,
  { show: boolean; type: string; light: boolean; white: boolean; reverse: boolean }
>(() => ({
  root: (props) => ({
    display: !props.show ? "none" : undefined,
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

export default function SmallCloud({ className, type, reverse, light, show, white }: any) {
  const classes = useStyles({
    type: type,
    reverse: reverse,
    light: light,
    white: white,
    show: show,
  });
  return <span className={`${className} ${classes.root}`} />;
}
