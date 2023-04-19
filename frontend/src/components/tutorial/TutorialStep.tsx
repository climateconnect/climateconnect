import { Button, Popper, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext, useEffect } from "react";
import Typist from "react-typist";
import {
  default as get_steps,
  default as tutorial_steps,
} from "../../../public/data/tutorial_steps";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: theme.spacing(0.75),
    background: theme.palette.primary.main,
    color: "white",
    padding: theme.spacing(2),
    width: 450,
    boxShadow: `3px 3px 3px ${theme.palette.secondary.light}`,
    position: "relative",
    textAlign: "left",
  },
  headline: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    color: "white",
  },
  text: {
    fontSize: 17.5,
    position: "absolute",
    color: "white",
  },
  buttonsContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
  },
  skipButtonContainer: {
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
  },
  skipButton: {
    color: "white",
    padding: 0,
    width: "auth",
    fontWeight: 600,
    fontSize: 14,
  },
  forwardButton: {
    background: theme.palette.primary.extraLight,
    minWidth: 100,
    "&:hover": {
      background: "#fff",
    },
  },
  backwardButton: {
    marginRight: theme.spacing(1),
    width: 100,
    border: "1px solid white",
    color: "white",
  },
  marginLeft: {
    marginLeft: theme.spacing(1),
  },
  spreadOut: {
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(0),
    right: theme.spacing(-2),
    color: "white",
    fontSize: 5,
  },
  popper: {
    display: "flex",
    alignItems: "center",
    zIndex: 102,
  },
  vertical: {
    flexDirection: "column",
  },
  arrowLeftIcon: {
    fontSize: 70,
    marginRight: -30,
    marginLeft: -25,
  },
  arrowBottomIcon: {
    fontSize: 70,
    marginTop: -30,
    marginBottom: -25,
    zIndex: 1,
  },
  arrowTopIcon: {
    fontSize: 70,
    marginBottom: -30,
    marginTop: -25,
  },
  textPlaceholder: {
    visibility: "hidden",
    fontSize: 17.5,
  },
}));

export default function TutorialStep({
  onClickSkip,
  onClickForward,
  onClickBackward,
  step,
  forwardWithValue,
  tutorialVariables,
  pointerRefs,
  nextStepTriggeredBy,
  curStepRef,
  hubName,
}): JSX.Element {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "tutorial", locale: locale });
  const curStep = get_steps(
    pointerRefs ? { ...pointerRefs, hubName: hubName, onClickForward: onClickForward } : {}
  )[step];
  const isFinalStep = step == tutorial_steps?.length - 1;

  useEffect(() => {
    if (nextStepTriggeredBy && nextStepTriggeredBy === curStep.triggerNext) {
      onClickForward();
    }
  }, [nextStepTriggeredBy]);

  const stepProps = {
    curStep: curStep,
    onClickSkip: onClickSkip,
    onClickForward: onClickForward,
    step: step,
    onClickBackward: onClickBackward,
    tutorialVariables: tutorialVariables,
    isFinalStep: isFinalStep,
    forwardWithValue: forwardWithValue,
    curStepRef: curStepRef,
    texts: texts,
  };
  const rect = curStep?.pointsAt?.current?.getBoundingClientRect();
  const rectIsHidden = rect && rect.height === 0 && rect.width === 0;
  if (curStep.pointsAt && !rectIsHidden) {
    return (
      <Popper
        open
        anchorEl={curStep?.pointsAt?.current}
        placement={curStep.placement ? (curStep.placement as any) : "right"}
        className={`${classes.popper} ${
          ["bottom", "bottom-start", "bottom-end", "top", "top-start", "top-end"].includes(
            curStep.placement as any
          ) && classes.vertical
        }`}
        // modifiers={{
        //   preventOverflow: {
        //     enabled: false,
        //     boundariesElement: "scrollParent",
        //   },
        //   flip: {
        //     enabled: false,
        //   },
        // }}
      >
        {(!curStep.placement || curStep.placement === "right") && (
          <ArrowLeftIcon color="primary" className={classes.arrowLeftIcon} />
        )}
        {curStep.placement && curStep.placement.includes("bottom") && (
          <ArrowDropUpIcon color="primary" className={classes.arrowTopIcon} />
        )}
        <Step {...stepProps} />
        {curStep.placement && curStep.placement.includes("top") && (
          <ArrowDropDownIcon color="primary" className={classes.arrowBottomIcon} />
        )}
      </Popper>
    );
  } else {
    return <Step {...stepProps} />;
  }
}

const Step = ({
  curStep,
  onClickSkip,
  onClickForward,
  step,
  onClickBackward,
  tutorialVariables,
  isFinalStep,
  forwardWithValue,
  curStepRef,
  texts,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root} ref={curStepRef}>
      <Typography component="h2" className={classes.headline}>
        {curStep.headline}
      </Typography>
      <Button onClick={onClickSkip} className={classes.closeButton}>
        <CloseIcon />
      </Button>
      <StepText curStep={curStep} tutorialVariables={tutorialVariables} key={step} />
      {step === 0 ? (
        <div className={classes.buttonsContainer}>
          <Button className={classes.backwardButton} onClick={onClickSkip}>
            {texts.no}
          </Button>
          <Button
            className={classes.forwardButton}
            onClick={() => onClickForward({ isStartingStep: true })}
          >
            {texts.yes}!
          </Button>
        </div>
      ) : curStep.button ? (
        curStep.button
      ) : (
        <ButtonBar
          onClickForward={onClickForward}
          onClickBackward={onClickBackward}
          // isFinalStep={isFinalStep}
          possibleAnswers={curStep.possibleAnswers}
          variableToSet={curStep.setsValue}
          forwardWithValue={forwardWithValue}
          texts={texts}
        />
      )}
    </div>
  );
};

const ButtonBar = ({
  variableToSet,
  onClickForward,
  onClickBackward,
  possibleAnswers,
  forwardWithValue,
  texts,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.buttonsContainer}>
      {possibleAnswers && variableToSet ? (
        <div className={classes.spreadOut}>
          {Object.keys(possibleAnswers).map((key) => {
            return (
              <Button
                key={key}
                className={`${classes.forwardButton} ${
                  Object.keys(possibleAnswers).indexOf(key) !== 0 && classes.marginLeft
                }`}
                onClick={() =>
                  forwardWithValue({
                    variable: variableToSet,
                    value: possibleAnswers[key],
                  })
                }
              >
                {key}
              </Button>
            );
          })}
        </div>
      ) : (
        <div>
          <Button className={classes.backwardButton} onClick={onClickBackward}>
            {texts.back}
          </Button>
          <Button className={classes.forwardButton} onClick={onClickForward}>
            {texts.next}
          </Button>
        </div>
      )}
    </div>
  );
};

const StepText = ({ curStep, tutorialVariables }) => {
  const classes = useStyles();

  const getTextFromStep = () => {
    //If there is just one possible text in this step, return that text
    if (curStep.text) return curStep.text;
    //If there are multiple options for texts to display based on the users choices, display the correct text
    else {
      for (const variable of Object.keys(tutorialVariables)) {
        if (curStep.texts && curStep.texts[variable]) {
          return curStep.texts[variable][tutorialVariables[variable]];
        }
      }
    }
  };

  return (
    <div /*className={classes.textBox}*/>
      {!curStep.preventUsingTypist && (
        <Typist cursor={{ show: false }} stdTypingDelay={0} avgTypingDelay={20}>
          <Typography className={classes.text}>{getTextFromStep()}</Typography>
        </Typist>
      )}
      <Typography className={!curStep.preventUsingTypist ? classes.textPlaceholder : undefined}>
        {getTextFromStep()}
      </Typography>
    </div>
  );
};
