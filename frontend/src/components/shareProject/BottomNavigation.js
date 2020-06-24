import React from "react";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    navigationButtonWrapper: {
      marginTop: theme.spacing(10)
    },
    backButton: {
      color: theme.palette.primary.main
    },
    nextStepButtonsContainer: {
      float: "right",
      [theme.breakpoints.down("xs")]: {
        float: "none",
        marginTop: theme.spacing(2)
      }
    },
    draftButton: {
      marginRight: theme.spacing(2)
    }
  };
});

export default function BottomNavigation({
  className,
  onClickPreviousStep,
  nextStepButtonType,
  onClickNextStep,
  saveAsDraft
}) {
  const classes = useStyles();
  return (
    <div className={`${className} ${classes.navigationButtonWrapper}`}>
      <Button variant="contained" className={classes.backButton} onClick={onClickPreviousStep}>
        Back
      </Button>
      <div className={classes.nextStepButtonsContainer}>
        {saveAsDraft && (
          <Button
            variant="contained"
            onClick={saveAsDraft}
            className={`${classes.backButton} ${classes.draftButton}`}
          >
            Save as Draft
          </Button>
        )}
        <NextButtons nextStepButtonType={nextStepButtonType} onClickNextStep={onClickNextStep} />
      </div>
    </div>
  );
}

function NextButtons({ nextStepButtonType, onClickNextStep }) {
  if (nextStepButtonType === "submit")
    return (
      <Button variant="contained" color="primary">
        Next Step
      </Button>
    );
  else if (nextStepButtonType === "publish")
    return (
      <Button variant="contained" color="primary" type="submit">
        Publish
      </Button>
    );
  else
    return (
      <Button variant="contained" color="primary" type="submit" onClick={onClickNextStep}>
        Next Step
      </Button>
    );
}
