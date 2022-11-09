import { makeStyles, Typography } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles(() => ({
  header: (props) => ({
    fontSize:
      props.size === "tiny" ? 30 : props.size === "small" ? 35 : props.size === "medium" ? 40 : 60,
    textAlign: "center",
    fontWeight: 300,
    fontFamily: "flood-std, sans-serif",
  }),
}));

export default function ClimateMatchHeadline({ children, className, size }: any) {
  const classes = useStyles({ size: size });
  return (
    <Typography
      variant="climateMatch"
      component="h1"
      className={`${className} ${classes.header}`}
      noSpaceBottom
    >
      {children}
    </Typography>
  );
}
