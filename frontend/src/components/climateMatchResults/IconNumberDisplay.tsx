import { Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    cursor: "default",
  },
  number: {
    marginLeft: theme.spacing(0.25),
    fontSize: 15,
  },
  icon: {
    fontSize: 15,
    marginBottom: theme.spacing(-0.25),
  },
}));

export default function IconNumberDisplay({ icon, number, name, className }) {
  const classes = useStyles();
  return (
    <Tooltip title={name}>
      <div className={`${classes.root} ${className}`}>
        <icon.icon color="primary" className={classes.icon} />
        <Typography className={classes.number}>{number}</Typography>
      </div>
    </Tooltip>
  );
}
