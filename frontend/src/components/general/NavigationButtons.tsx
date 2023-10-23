import { Button, CircularProgress, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { MouseEventHandler, useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

const useStyles = makeStyles((theme) => {
  return {
    navigationButtonWrapper: (props: any) => ({
      marginTop: props.position !== "top" ? theme.spacing(10) : theme.spacing(6),
      marginBottom: props.position === "top" && theme.spacing(4),
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: theme.spacing(2),
      [theme.breakpoints.down("md")]: {
        position: props.fixedOnMobile && "fixed",
        bottom: props.fixedOnMobile && 0,
        left: props.fixedOnMobile && 0,
        right: props.fixedOnMobile && 0,
        alignItems: props.fixedOnMobile && "center",
        paddingBottom: props.fixedOnMobile && theme.spacing(1),
        background: props.fixedOnMobile && theme.palette.grey.light,
        zIndex: props.fixedOnMobile && 10,
      },
    }),
    backButton: {
      color: theme.palette.primary.main,
    },
    nextStepButtonsContainer: (props: any) => ({
      [theme.breakpoints.down("sm")]: {
        display: "flex",
        justifyContent: "space-between",
      },
    }),
    draftButton: {
      marginRight: theme.spacing(2),
    },
    translationLoader: {
      color: "white",
    },
    cancelButtonTop: {
      float: "left",
    },
    publishButtonOwnLine: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(2),
    },
  };
});

type Args = {
  className?: string;
  onClickPreviousStep?: MouseEventHandler<HTMLAnchorElement>;
  onClickCancel?: Function;
  nextStepButtonType?: "submit" | "save" | "publish";
  onClickNextStep?: MouseEventHandler<HTMLAnchorElement>;
  saveAsDraft?: Function;
  additionalButtons?: any;
  loadingSubmit?: boolean;
  loadingSubmitDraft?: boolean;
  position?: "top" | "bottom";
  fixedOnMobile?: boolean;
};

export default function NavigationButtons({
  className,
  onClickPreviousStep,
  onClickCancel,
  nextStepButtonType,
  onClickNextStep,
  saveAsDraft,
  additionalButtons,
  loadingSubmit,
  loadingSubmitDraft,
  position,
  fixedOnMobile,
}: Args) {
  const classes = useStyles({ position: position, fixedOnMobile: fixedOnMobile });
  const [open, setOpen] = React.useState(false);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const isMobileScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const onClickCancelDialogOpen = () => {
    setOpen(true);
  };

  const handleClickCancel = (cancelled) => {
    if (cancelled && onClickCancel) {
      onClickCancel();
      setOpen(false);
    } else setOpen(false);
  };

  const CancelButton = () => (
    <>
      <Button
        variant="contained"
        color="grey"
        onClick={onClickCancelDialogOpen}
        className={`${classes.backButton} ${classes.draftButton}`}
      >
        {position === "top" || (isNarrowScreen && fixedOnMobile) ? <ArrowBackIcon /> : texts.cancel}
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
  );

  return (
    <div className={`${classes.navigationButtonWrapper} ${className}`}>
      {onClickPreviousStep && (
        <Button
          variant="contained"
          color="grey"
          className={classes.backButton}
          onClick={onClickPreviousStep}
        >
          {texts.back}
        </Button>
      )}
      {position === "top" && <CancelButton />}
      <div className={classes.nextStepButtonsContainer}>
        {onClickCancel && position !== "top" && <CancelButton />}
        {additionalButtons &&
          additionalButtons.map((b, index) => (
            <Button
              key={index}
              variant="contained"
              color="grey"
              onClick={b.onClick}
              className={`${classes.backButton} ${classes.draftButton}`}
            >
              {fixedOnMobile && isNarrowScreen ? <b.icon /> : b.text}
            </Button>
          ))}
        {saveAsDraft && (
          <Button
            variant="contained"
            color="grey"
            onClick={saveAsDraft}
            className={`${classes.backButton} ${classes.draftButton}`}
            disabled={loadingSubmitDraft || loadingSubmit}
          >
            {loadingSubmitDraft ? (
              <CircularProgress className={classes.translationLoader} size={23} />
            ) : (
              texts.save_as_draft
            )}
          </Button>
        )}
        {!(fixedOnMobile && isMobileScreen && onClickCancel && additionalButtons.length > 1) && (
          <NextButtons
            nextStepButtonType={nextStepButtonType}
            onClickNextStep={onClickNextStep}
            texts={texts}
            loadingSubmit={loadingSubmit}
            loadingSubmitDraft={loadingSubmitDraft}
            fixedOnMobile={fixedOnMobile}
            isNarrowScreen={isNarrowScreen}
          />
        )}
      </div>
      {fixedOnMobile && isMobileScreen && onClickCancel && additionalButtons.length > 1 && (
        <div className={classes.publishButtonOwnLine}>
          <NextButtons
            nextStepButtonType={nextStepButtonType}
            onClickNextStep={onClickNextStep}
            texts={texts}
            loadingSubmit={loadingSubmit}
            loadingSubmitDraft={loadingSubmitDraft}
            fixedOnMobile={fixedOnMobile}
            isNarrowScreen={isNarrowScreen}
          />
        </div>
      )}
    </div>
  );
}

function NextButtons({
  nextStepButtonType,
  onClickNextStep,
  texts,
  loadingSubmit,
  loadingSubmitDraft,
  fixedOnMobile,
  isNarrowScreen,
}) {
  const classes = useStyles();
  if (nextStepButtonType === "submit")
    return (
      <Button variant="contained" color="primary" type="submit">
        {texts.next_step}
      </Button>
    );
  else if (nextStepButtonType === "save")
    return (
      <Button variant="contained" color="primary" type="submit">
        {fixedOnMobile && isNarrowScreen ? <SaveIcon /> : texts.save_changes}
      </Button>
    );
  else if (nextStepButtonType === "publish")
    return (
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={loadingSubmit || loadingSubmitDraft}
      >
        {loadingSubmit ? (
          <CircularProgress className={classes.translationLoader} size={23} />
        ) : (
          texts.publish
        )}
      </Button>
    );
  else
    return (
      <Button variant="contained" color="primary" type="submit" onClick={onClickNextStep}>
        {texts.next_step}
      </Button>
    );
}
