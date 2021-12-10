import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  step: {
    display: "flex",
    flexDirection: "row",
  },
  stepGrafic: {
    position: "relative",
    width: theme.spacing(6),
    marginLeft: theme.spacing(2),
  },
  connector: {
    position: "absolute",
    height: "100%",
    border: `${theme.spacing(0.25)}px solid ${theme.palette.primary.main}`,
    left: "0%",
    transform: "translate(-50%, 0)",
  },
  icon: {
    position: "absolute",
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: theme.palette.primary.main,
    left: "0%",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
  },
  content: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  bottomPadding: {
    height: theme.spacing(6),
  },
}));

export default function StepsTrackerVertical({ index, lastIndex, content }) {
  const classes = useStyles();
  const connectorClass = index === lastIndex ? classes.noConnector : classes.connector;
  return (
    <div>
      <div className={classes.step}>
        <div className={classes.stepGrafic}>
          <div className={connectorClass} />
          <div className={classes.icon} />
        </div>
        <div className={classes.content}>
          <div>{content}</div>
          <div className={classes.bottomPadding} />
        </div>
      </div>
    </div>
  );
}