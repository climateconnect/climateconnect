import { Button, CircularProgress, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { MouseEventHandler, useContext, useState } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

const useStyles = makeStyles((theme) => {
  return {
    navigationButtonWrapper: (props: any) => {
      // Sticky mode: fixed to the bottom of the viewport at ALL screen sizes
      if (props.sticky) {
        return {
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "flex-end",
          alignItems: "stretch",
          columnGap: theme.spacing(1),
          paddingTop: theme.spacing(1.5),
          paddingBottom: theme.spacing(1.5),
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          background: theme.palette.background.paper,
          boxShadow: "0px -2px 8px rgba(0,0,0,0.12)",
          zIndex: 1100,
        };
      }
      // Default (non-sticky) mode — unchanged
      return {
        marginTop: props.position !== "top" ? theme.spacing(10) : theme.spacing(6),
        marginBottom: props.position === "top" ? theme.spacing(4) : 0,
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
          display: "flex",
          justifyContent: "center",
        },
      };
    },
    backButton: {
      color: theme.palette.background.default_contrastText,
    },
    stickyBackButton: {
      marginRight: "auto",
      flexShrink: 0,
    },
    stickyCompact: {
      // On very narrow screens reduce button padding so Draft + Next fit side-by-side
      [theme.breakpoints.down("sm")]: {
        "& .MuiButton-root": {
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
        },
      },
    },
    nextStepButtonsContainer: {
      [theme.breakpoints.down("sm")]: {
        display: "flex",
        justifyContent: "space-between",
      },
    },
    stickyNextContainer: {
      // Fill remaining space so buttons inside have a real width to share
      flex: 1,
      display: "flex",
      flexWrap: "nowrap",
      alignItems: "stretch",
      justifyContent: "flex-end",
      "& .MuiButton-root": {
        flex: 1,
        whiteSpace: "normal",
        maxWidth: 180,
      },
    },
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
  onClickPreviousStep?: MouseEventHandler<HTMLButtonElement>;
  onClickCancel?: Function;
  nextStepButtonType?: "submit" | "save" | "publish";
  onClickNextStep?: MouseEventHandler<HTMLButtonElement>;
  saveAsDraft?: MouseEventHandler<HTMLButtonElement>;
  additionalButtons?: any;
  loadingSubmit?: boolean;
  loadingSubmitDraft?: boolean;
  position?: "top" | "bottom";
  fixedOnMobile?: boolean;
  /** When true the bar is always fixed at the viewport bottom (all screen sizes). */
  sticky?: boolean;
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
  sticky,
}: Args) {
  const classes = useStyles({ position, fixedOnMobile, sticky });
  const [open, setOpen] = useState(false);
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
    <div
      className={`${classes.navigationButtonWrapper} ${sticky ? classes.stickyCompact : ""} ${
        className ?? ""
      }`}
    >
      {onClickPreviousStep && (
        <Button
          variant="contained"
          color="grey"
          className={`${classes.backButton} ${sticky ? classes.stickyBackButton : ""}`}
          onClick={onClickPreviousStep}
          aria-label={sticky && isMobileScreen ? texts.back : undefined}
        >
          {sticky && isMobileScreen ? <ArrowBackIcon /> : texts.back}
        </Button>
      )}
      {position === "top" && onClickCancel && <CancelButton />}
      <div
        className={`${classes.nextStepButtonsContainer} ${
          sticky ? classes.stickyNextContainer : ""
        }`}
      >
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
  const classes = useStyles({});
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
