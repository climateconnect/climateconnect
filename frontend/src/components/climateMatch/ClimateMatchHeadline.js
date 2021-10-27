import { makeStyles, Typography } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  header: (props) => ({
    fontSize: props.size === "medium" ? 40 : 60,
    textAlign: "center",
    fontWeight: 300,
  }),
}));

export default function ClimateMatchHeadline({ children, className, size }) {
  const classes = useStyles({ size: size });
  return (
    <Typography variant="climateMatch" component="h1" className={`${className} ${classes.header}`}>
      {children}
    </Typography>
  );
}
