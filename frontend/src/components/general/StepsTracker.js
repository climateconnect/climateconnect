import React from "react";
import { PropTypes } from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Stepper, Step, StepLabel, StepConnector, Typography } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";

const ICON_OFFSET = 3; //offset required to center icons horizontally in px.

const useStyles = makeStyles(theme => {
  return {
    stepper: {
      maxWidth: 1000,
      margin: "0 auto"
    },
    grayBackgroundRoot: {
      backgroundColor: "#F7F7F7",
      paddingTop: theme.spacing(10),
      paddingBottom: theme.spacing(6)
    },
    grayBackground: {
      backgroundColor: "#F7F7F7"
    },
    customIcon: {
      backgroundColor: theme.palette.primary.main,
      display: "flex",
      height: 20,
      width: 20,
      borderRadius: 20,
      alignItems: "center",
      marginTop: ICON_OFFSET,
      zIndex: 10
    },
    customIconMarginBottom: {
      marginBottom: 10
    },
    stepText: {
      fontSize: 13,
      textTransform: "uppercase"
    },
    active: {
      height: 40,
      width: 40,
      border: "10px solid #D7E2E4",
      borderRadius: 20,
      marginTop: ICON_OFFSET - 10,
      marginLeft: -10,
      position: "absolute"
    },
    completed: {
      backgroundColor: "#D7E2E4",
      height: 40,
      width: 40,
      border: "10px solid #D7E2E4",
      borderRadius: 20,
      marginTop: ICON_OFFSET - 10,
      fontSize: "bold"
    },
    completedText: {
      color: "#a4b4b7"
    }
    /*topDivActive: {
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
    }*/
  };
});

const CustomConnector = withStyles(theme => {
  return {
    root: {
      left: "calc(-50%)",
      right: "calc(50%)"
    },
    line: {
      height: 3,
      border: 0,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 1,
      margin: 0,
      zIndex: 9
    },
    completed: {
      "& $line": {
        backgroundColor: "#bbced2"
      }
    },
    active: {
      "& $line": {
        backgroundColor: "#bbced2"
      }
    }
  };
})(StepConnector);

const CustomStepIcon = props => {
  const classes = useStyles();
  const { active, completed } = props;
  if (completed)
    return <CheckIcon color="primary" className={`${classes.customIcon} ${classes.completed}`} />;
  else if (active)
    return (
      <>
        <div className={`${classes.customIcon} ${classes.customIconMarginBottom}`} />
        <div className={classes.active} />
      </>
    );
  else return <div className={`${classes.customIcon} ${classes.customIconMarginBottom}`} />;
};

export default function StepsTracker({ steps, activeStep, grayBackground, onlyDisplayActiveStep }) {
  const classes = useStyles();
  const activeStepIndex = steps.indexOf(steps.find(step => step.key === activeStep));
  return (
    <div className={`${grayBackground && classes.grayBackgroundRoot}`}>
      <Stepper
        activeStep={activeStepIndex}
        alternativeLabel
        connector={<CustomConnector />}
        className={`${classes.stepper} ${grayBackground && classes.grayBackground}`}
      >
        {steps.map((step, index) => (
          <Step className={classes.step} key={index}>
            <StepLabel
              StepIconComponent={CustomStepIcon}
              color="primary"
              className={classes.stepText}
            >
              <Typography
                color="primary"
                className={`${classes.stepText} ${index < activeStepIndex &&
                  classes.completedText}`}
              >
                {(!onlyDisplayActiveStep || index === activeStepIndex) && step.text}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

StepsTracker.propTypes = {
  steps: PropTypes.array.isRequired,
  activeStep: PropTypes.string.isRequired,
  grayBackground: PropTypes.bool
};
