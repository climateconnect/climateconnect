import React from "react";
import { Typography, makeStyles, Link } from "@material-ui/core";
import Stat from "./Stat";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 310,
    background: "#EBEBEB",
    padding: theme.spacing(2),
  },
  h2: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: 21,
    marginBottom: theme.spacing(1),
    textAlign: "center",
  },
  link: {
    cursor: "pointer",
  },
  source: {
    fontSize: 14,
    textAlign: "center",
  },
}));

export default function StatBox({ name, stats }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography component="h2" className={classes.h2}>
        {name} is responsible for
      </Typography>
      {stats.map((s) => (
        <Stat key={s.name} statData={s} />
      ))}
      <Typography className={classes.source}>
        Source:{" "}
        <Link className={classes.link} target="_blank" href={stats[0].source_link}>
          {stats[0].source_name}
        </Link>
      </Typography>
    </div>
  );
}
