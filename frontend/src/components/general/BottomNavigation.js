import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";

const useStyles = makeStyles((theme) => {
  return {
    navigationButtonWrapper: {
      marginTop: theme.spacing(10),
    },
    backButton: {
      color: theme.palette.primary.main,
    },
    nextStepButtonsContainer: {
      float: "right",
      [theme.breakpoints.down("xs")]: {
        float: "none",
        marginTop: theme.spacing(2),
      },
    },
    draftButton: {
      marginRight: theme.spacing(2),
    },
  };
});

export default function BottomNavigation({
  className,
  onClickPreviousStep,
  onClickCancel,
  nextStepButtonType,
  onClickNextStep,
  saveAsDraft,
  additionalButtons,
}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const onClickCancelDialogOpen = () => {
    setOpen(true);
  };

  const handleClickCancel = (cancelled) => {
    if (cancelled) {
      onClickCancel();
      setOpen(false);
    } else setOpen(false);
  };

  return (
    <div className={`${classes.navigationButtonWrapper} ${className}`}>
      {onClickPreviousStep && (
        <Button variant="contained" className={classes.backButton} onClick={onClickPreviousStep}>
          {texts.back}
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
              {texts.cancel}
            </Button>
            <ConfirmDialog
              open={open}
              onClose={handleClickCancel}
              cancelText={texts.no}
              confirmText={texts.yes}
              text={texts.do_you_really_want_to_leave_without_saving_your_changes}
              title={texts.leave_without_saving_changes}
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
            {texts.save_as_draft}
          </Button>
        )}
        <NextButtons
          nextStepButtonType={nextStepButtonType}
          onClickNextStep={onClickNextStep}
          texts={texts}
        />
      </div>
    </div>
  );
}

function NextButtons({ nextStepButtonType, onClickNextStep, texts }) {
  if (nextStepButtonType === "submit")
    return (
      <Button variant="contained" color="primary" type="submit">
        {texts.next_step}
      </Button>
    );
  else if (nextStepButtonType === "save")
    return (
      <Button variant="contained" color="primary" type="submit">
        {texts.save_changes}
      </Button>
    );
  else if (nextStepButtonType === "publish")
    return (
      <Button variant="contained" color="primary" type="submit">
        {texts.publish}
      </Button>
    );
  else
    return (
      <Button variant="contained" color="primary" type="submit" onClick={onClickNextStep}>
        {texts.next_step}
      </Button>
    );
}
