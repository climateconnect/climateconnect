import React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import Stat from "./Stat";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 310,
    background: "#EBEBEB",
    padding: theme.spacing(2),
  },
  h2: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: 21,
    marginBottom: theme.spacing(1),
  },
}));

export default function StatBox({ name, stats }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography component="h2" className={classes.h2}>
        {name} accounts for
      </Typography>
      {stats.map((s) => (
        <Stat key={s.name} statData={s} />
      ))}
    </div>
  );
}
