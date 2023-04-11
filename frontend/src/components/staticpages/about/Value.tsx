import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    boxShadow: "0px 3px 6px #00000029",
    width: 130,
    height: 130,
    marginBottom: theme.spacing(3),
    textAlign: "center",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
  },
  icon: {
    color: theme.palette.primary.light,
    fontSize: 40,
    width: 40,
    height: 40,
  },
  text: {
    color: theme.palette.yellow.main,
    fontWeight: 600,
  },
}));
export default function Value({ iconSrc, icon, text }: { iconSrc?; icon?; text: string }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.iconWrapper}>
        {icon ? (
          <icon.src className={classes.icon} />
        ) : (
          <img src={iconSrc} className={classes.icon} />
        )}
      </div>
      <Typography component="h2" className={classes.text}>
        {text}
      </Typography>
    </div>
  );
}
