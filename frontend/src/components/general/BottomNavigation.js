import React from "react";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ConfirmDialog from "../dialogs/ConfirmDialog";

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
  onClickCancel,
  nextStepButtonType,
  onClickNextStep,
  saveAsDraft,
  additionalButtons
}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const onClickCancelDialogOpen = () => {
    setOpen(true);
  };

  const handleClickCancel = cancelled => {
    if (cancelled) {
      onClickCancel();
      setOpen(false);
    } else setOpen(false);
  };

  return (
    <div className={`${classes.navigationButtonWrapper} ${className}`}>
      {onClickPreviousStep && (
        <Button variant="contained" className={classes.backButton} onClick={onClickPreviousStep}>
          Back
        </Button>
      )}
      <div className={classes.nextStepButtonsContainer}>
        {onClickCancel && (
          <>
            <Button
              variant="contained"
              onClick={onClickCancelDialogOpen}
              className={`${classes.backButton} ${classes.draftButton}`}
            >
              Cancel
            </Button>
            <ConfirmDialog
              open={open}
              onClose={handleClickCancel}
              cancelText="No"
              confirmText="Yes"
              text="Do you really want to leave without saving your changes?"
              title="Leave without saving changes?"
            />
          </>
        )}
        {additionalButtons &&
          additionalButtons.map((b, index) => (
            <Button
              key={index}
              variant="contained"
              onClick={b.onClick}
              className={`${classes.backButton} ${classes.draftButton}`}
            >
              {b.text}
            </Button>
          ))}
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
      <Button variant="contained" color="primary" type="submit">
        Next Step
      </Button>
    );
  else if (nextStepButtonType === "save")
    return (
      <Button variant="contained" color="primary" type="submit">
        Save Changes
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
