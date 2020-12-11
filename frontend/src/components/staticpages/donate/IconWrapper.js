import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  iconContainer: {
    width: 40,
  },
  icon: {
    width: "100%",
  },
  leftWrapper: {
    padding: theme.spacing(4),
    paddingTop: theme.spacing(1),
    paddingBottom: 0,
  },
}));

export default function IconWrapper({ src }) {
  const classes = useStyles();
  return (
    <div className={classes.leftWrapper}>
      <div className={classes.iconContainer}>
        <img className={classes.icon} src={src} />
      </div>
    </div>
  );
}
