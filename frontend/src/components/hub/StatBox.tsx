import { Link, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";

import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
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

export default function StatBox({ title, stats }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });

  return (
    <div className={classes.root}>
      <Typography component="h2" className={classes.h2}>
        {title}
      </Typography>
      {stats?.length > 0 && stats.map((s) => <Stat key={s.name} statData={s} />)}
      {stats && stats.length > 0 && stats[0]?.source_link && (
        <Typography className={classes.source}>
          {texts.source}:{" "}
          <Link
            className={classes.link}
            target="_blank"
            href={stats[0].source_link}
            underline="hover"
          >
            {stats[0].source_name}
          </Link>
        </Typography>
      )}
    </div>
  );
}
