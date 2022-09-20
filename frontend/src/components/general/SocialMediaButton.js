import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(() => ({
  inheritColor: {
    color: "inherit",
  },
}));

export default function SocialMediaButton({ href, icon }) {
  const classes = useStyles();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes.inheritColor}>
      {icon}
    </a>
  );
}
