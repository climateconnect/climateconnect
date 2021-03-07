import { Button, Fade, makeStyles, Tooltip, useMediaQuery } from "@material-ui/core";
import React, { useContext, useEffect, useRef } from "react";
import Cookies from "universal-cookie";
import get_steps from "../../../public/data/tutorial_steps";
import { isOnScreen } from "../../../public/lib/generalOperations";
import {
  getLastCompletedTutorialStep,
  getTutorialStepFromCookie
} from "../../../public/lib/tutorialOperations";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import TutorialStep from "./TutorialStep";

const useStyles = makeStyles((theme) => ({
  openTutorialButton: {
    position: "fixed",
    bottom: "calc(50vh - 110px)",
    transform: "rotate(-90deg)",
    right: -27.35,
  },
  fixedPosition: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: "calc(50vw - 225px)",
    zIndex: 102,
  },
  buttonText: {
    color: theme.palette.primary.main,
  },
  leaveSpaceForCookieBanner: {
    bottom: theme.spacing(20),
  },
}));

export default function Tutorial({ fixedPosition, pointerRefs, nextStepTriggeredBy, hubName }) {
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles();
  const cookies = new Cookies();
  const tutorialCookie = cookies.get("finishedTutorialSteps");
  const { acceptedNecessary, user } = useContext(UserContext);
  const tutorialSteps = get_steps(pointerRefs ? { ...pointerRefs, hubName: hubName } : {});
  const curStepRef = useRef(null);

  const now = new Date();
  const oneYearFromNow = new Date(now.setFullYear(now.getFullYear() + 1));

  const getNewCookieValue = (direction, step) => {
    const oldCookieValue = cookies.get("finishedTutorialSteps");
    if (direction === "forward") {
      if (oldCookieValue) {
        const finishedSteps = oldCookieValue.split(",").map((s) => parseInt(s));
        //make sure we don't insert the same step twice
        if (finishedSteps[finishedSteps.length - 1] === step) return oldCookieValue;
        else return oldCookieValue + "," + step;
      } else {
        return step;
      }
    }
    if (direction === "backward") {
      if (oldCookieValue) {
        const finishedSteps = oldCookieValue.split(",");
        finishedSteps.pop();
        return finishedSteps.join(",");
      }
    }
  };

  const tutVarsCookie = cookies.get("tutorialVariables");

  const [step, setStep] = React.useState(
    tutorialCookie ? getTutorialStepFromCookie(tutorialSteps, tutorialCookie, user) : 0
  );
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [showMinimizedAlert, setShowMinimizedAlert] = React.useState(false);
  const [tutorialVariables, setTutorialVariables] = React.useState(
    tutVarsCookie ? tutVarsCookie : {}
  );
  useEffect(function () {
    if (step === 0) {
      setTimeout(function () {
        setShowTutorial(true);
      }, 5000);
    } else {
      setShowTutorial(true);
    }
  }, []);

  useEffect(
    function () {
      setTimeout(function () {
        //short circuit if there isn't an active step element right now
        if (!curStepRef?.current) return;
        if (tutorialSteps[step]?.placement === "top") {
          if (!isOnScreen(curStepRef.current))
            curStepRef.current.scrollIntoView({ behavior: "smooth" });
        } else if (tutorialSteps[step]?.pointsAt?.current) {
          if (!isOnScreen(tutorialSteps[step].pointsAt.current))
            tutorialSteps[step].pointsAt.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    },
    [step]
  );

  const onClickSkip = () => {
    const finishedSteps = cookies.get("finishedTutorialSteps");
    cookies.set("lastStepBeforeSkipTutorial", getLastCompletedTutorialStep(finishedSteps), {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    cookies.set("finishedTutorialSteps", "-1", {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    setStep(-1);
    setShowMinimizedAlert(true);
    setTimeout(() => setShowMinimizedAlert(false), 3000);
  };

  const resetSteps = () => {
    cookies.set("finishedTutorialSteps", "", {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    setStep(0);
  };

  const handleClickForward = () => {
    const newCookieValue = getNewCookieValue("forward", step);
    cookies.set("finishedTutorialSteps", newCookieValue, {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    setStep(getTutorialStepFromCookie(tutorialSteps, newCookieValue, user));
  };

  const handleClickBackward = () => {
    const newCookieValue = getNewCookieValue("backward", step);
    cookies.set("finishedTutorialSteps", newCookieValue, {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    setStep(getTutorialStepFromCookie(tutorialSteps, newCookieValue, user));
  };

  const forwardWithValue = ({ variable, value }) => {
    const curTutorialVariablesCookie = cookies.get("tutorialVariables");
    const curTutorialVariables = curTutorialVariablesCookie ? curTutorialVariablesCookie : {};
    curTutorialVariables[variable] = value;
    cookies.set("finishedTutorialSteps", getNewCookieValue("forward", step), {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    cookies.set("tutorialVariables", JSON.stringify(curTutorialVariables), {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    setTutorialVariables(curTutorialVariables);
    setStep(getTutorialStepFromCookie(tutorialSteps, getNewCookieValue("forward", step), user));
  };

  if (!isNarrowScreen) {
    if (step < 0) {
      return (
        <Tooltip
          title="Click here to go back to the tutorial"
          open={showMinimizedAlert}
          placement="left"
          arrow
        >
          <Button
            variant="contained"
            size="small"
            classes={{
              root: classes.openTutorialButton,
              label: classes.buttonText,
            }}
            onClick={resetSteps}
          >
            Tutorial
          </Button>
        </Tooltip>
      );
    }
    return (
      <Fade in={showTutorial}>
        <div
          className={`
            ${fixedPosition && classes.fixedPosition} 
            ${!acceptedNecessary && classes.leaveSpaceForCookieBanner}
          `}
        >
          {showTutorial && (
            <TutorialStep
              onClickSkip={onClickSkip}
              step={step}
              onClickForward={handleClickForward}
              onClickBackward={handleClickBackward}
              forwardWithValue={forwardWithValue}
              tutorialVariables={tutorialVariables}
              pointerRefs={pointerRefs}
              nextStepTriggeredBy={nextStepTriggeredBy}
              curStepRef={curStepRef}
              hubName={hubName}
            />
          )}
        </div>
      </Fade>
    );
  } else return <></>;
}
