import React from "react";
import { PropTypes } from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => {
  return {
    grayBackground: {
      backgroundColor: "#F7F7F7",
      paddingTop: theme.spacing(10),
      paddingBottom: theme.spacing(6)
    },
    stepsContainer: {
      display: "flex",
      position: "relative",
      justifyContent: "space-between",
      textTransform: "uppercase"
    },
    step: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center"
    },
    stepText: {
      fontSize: 13,
      marginTop: theme.spacing(4)
    },
    topDiv: {
      content: '""',
      position: "absolute",
      top: -10,
      display: "block",
      margin: "0 auto",
      height: 20,
      width: 20,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 10,
      fontSize: 100
    },
    topDivActive: {
      content: '""',
      position: "absolute",
      top: -20,
      display: "block",
      margin: "0 auto",
      height: 40,
      width: 40,
      backgroundColor: "#D7E2E4",
      borderRadius: 20,
      fontSize: 100
    },
    progressTrack: {
      position: "absolute",
      top: 0,
      height: 2,
      width: "100%",
      background: theme.palette.primary.main,
      zIndex: 10
    }
  };
});

export default function StepsTracker({ steps, activeStep, className, grayBackground }) {
  const classes = useStyles();
  return (
    <div className={`${grayBackground && classes.grayBackground}`}>
      <div className={`${classes.stepsContainer} ${className}`}>
        <div className={classes.progressTrack} />
        {steps.map((step, index) => (
          <div className={classes.step} key={index}>
            {step.key === activeStep && <span className={classes.topDivActive} />}
            <span className={classes.topDiv} />
            <Typography color="primary" className={classes.stepText}>
              {step.text}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}

StepsTracker.propTypes = {
  steps: PropTypes.array.isRequired,
  activeStep: PropTypes.string.isRequired,
  grayBackground: PropTypes.boolean
};
