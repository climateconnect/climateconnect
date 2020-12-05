import React from "react";
import { makeStyles, withStyles, LinearProgress, Container, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: props => ({
    paddingTop: props.embedded ? 0 : theme.spacing(1),
    paddingBottom: props.embedded ? 0 : theme.spacing(1.5),
    background: props.embedded ? "transparent" : "#DFDFDF",
    position: props.embedded ? "auto" : "absolute",
    top: -90,
    zIndex: 3,
    left: 0,
    width: "100%",
    height: props.embedded ? "auto" : 95,
    [theme.breakpoints.down("sm")]: {
      position: props.embedded ? "auto" : "fixed",
      top: "auto",
      bottom: 42
    }
  }),
  rootFixed: {
    [theme.breakpoints.up("md")]: {
      position: "fixed",
      top: 0,
      borderTop: 0
    }
  },
  text: props => ({
    textAlign: "center",
    fontWeight: 600,
    color: props.embedded ? "white" : theme.palette.secondary.main,
    marginBottom: theme.spacing(1)
  }),
  amount: props => ({
    fontSize: props.embedded ? "auto" : 22,
    fontWeight: 600
  }),
  barContainer: {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 200 : 700]
  },
  bar: props => ({
    borderRadius: 5,
    backgroundColor: props.barColor ? props.barColor : theme.palette.primary.main
  })
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

export default function DonationGoal({ className, current, goal, name, embedded, barColor }) {
  //const atTopOfPage = TopOfPage({ initTopOfPage: true, marginToTrigger: 95 });
  const classes = useStyles({embedded: embedded, barColor: barColor});
  return (
    <div className={`${className} ${classes.root}`}>
      <Container>
        <Typography className={classes.text}>
          {name}:{!embedded &&<br />}{" "}
          <Typography className={classes.amount} component="span">
            {current}€
          </Typography>{" "}
          raised out of {goal}€ goal
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(current / goal) * 100}
          classes={{
            root: classes.barContainer,
            bar: classes.bar
          }}
        />
      </Container>
    </div>
  );
}
