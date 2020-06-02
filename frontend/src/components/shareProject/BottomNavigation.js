import React from "react";
import { Button } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => {  
  return {
    navigationButtonWrapper: {
      marginTop: theme.spacing(10)
    },
    backButton: {
      color: theme.palette.primary.main
    },
    nextStepButton: {
      float: "right"
    }
  }
})

export default function BottomNavigation({
  className,
  onClickPreviousStep,
  nextStepButtonType,
  onClickNextStep
}){
  const classes = useStyles();
  return (
    <div className={`${className} ${classes.navigationButtonWrapper}`}>
      <Button
        variant="contained"
        className={classes.backButton}
        onClick={onClickPreviousStep}
      >
        Back
      </Button>
      { nextStepButtonType === "submit" ?
          <Button
            variant="contained"
            className={classes.nextStepButton}
            color="primary"
            type="submit"
          >
            Next Step
          </Button>
          :
          <Button
            variant="contained"
            className={classes.nextStepButton}
            color="primary"
            onClick={onClickNextStep}
          >
            Next Step
          </Button>
      }
    </div>
  )
}