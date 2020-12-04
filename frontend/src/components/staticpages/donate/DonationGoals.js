import React from "react";
import { makeStyles, withStyles, LinearProgress, Container, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1.5),
    background: "#DFDFDF",
    position: "absolute",
    top: -30,
    zIndex: 3,
    left: 0,
    width: "100%",
    height: 95,
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      top: "auto",
      bottom: 42
    }
  },
  rootFixed: {
    [theme.breakpoints.up("md")]: {
      position: "fixed",
      top: 0,
      borderTop: 0
    }
  },
  text: {
    textAlign: "center",
    fontWeight: 600,
    color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1)
  },
  amount: {
    fontSize: 22,
    fontWeight: 600
  }
}));

const BorderLinearProgress = withStyles(theme => ({
  root: {
    height: 10,
    borderRadius: 5
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 200 : 700]
  },
  bar: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main
  }
}))(LinearProgress);

export default function DonationGoal({ className, current, goal, name }) {
  //const atTopOfPage = TopOfPage({ initTopOfPage: true, marginToTrigger: 95 });
  const classes = useStyles();
  return (
    <div className={`${className} ${classes.root}`}>
      <Container>
        <Typography className={classes.text}>
          {name}:<br />{" "}
          <Typography className={classes.amount} component="span">
            {current}€
          </Typography>{" "}
          raised out of {goal}€ goal
        </Typography>
        <BorderLinearProgress variant="determinate" value={(current / goal) * 100} />
      </Container>
    </div>
  );
}
