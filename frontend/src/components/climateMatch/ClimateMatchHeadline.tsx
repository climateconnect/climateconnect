import { Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles<Theme, { size: string }>(() => ({
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
      component="h1"
      className={`${className} ${classes.header}`}
      /*TODO(undefined) noSpaceBottom */
    >
      {children}
    </Typography>
  );
}
