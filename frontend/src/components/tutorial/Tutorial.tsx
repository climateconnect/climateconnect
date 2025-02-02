import { Button, Fade, Theme, Tooltip, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useEffect, useRef } from "react";
import Cookies from "universal-cookie";
import get_steps from "../../../public/data/tutorial_steps";
import { isOnScreen } from "../../../public/lib/generalOperations";
import {
  getLastCompletedTutorialStep,
  getTutorialStepFromCookie,
} from "../../../public/lib/tutorialOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import TutorialStep from "./TutorialStep";

const useStyles = makeStyles((theme) => ({
  openTutorialButton: {
    position: "fixed",
    bottom: "calc(50vh - 120px)",
    transform: "rotate(-90deg)",
    zIndex: 10,
    right: -34.75,
    color: theme.palette.background.default_contrastText,
    background: "#e6e6e6",
    padding: 6,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    "&:hover": {
      background: "#d6d6d6",
    },
  },
  fixedPosition: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: "calc(50vw - 225px)",
    zIndex: 102,
  },
  leaveSpaceForCookieBanner: {
    bottom: theme.spacing(20),
  },
}));

export default function Tutorial({
  fixedPosition,
  hubName,
  handleTabChange,
  nextStepTriggeredBy,
  pointerRefs,
  typesByTabValue,
}) {
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const classes = useStyles();
  const cookies = new Cookies();
  const tutorialCookie = cookies.get("finishedTutorialSteps");
  const { acceptedNecessary, user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "tutorial", locale: locale });
  const tutorialSteps = get_steps(pointerRefs ? { ...pointerRefs, hubName: hubName } : {});
  const curStepRef = useRef<null | HTMLElement>(null);

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
  const startingStep = tutorialCookie
    ? getTutorialStepFromCookie(tutorialSteps, tutorialCookie, user)
    : 0;
  const [step, setStep] = React.useState(startingStep);
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

  const handleSetStep = (nextStep) => {
    const tabLocationHash = tutorialSteps[nextStep]?.tabOfRef;
    if (tabLocationHash && tabLocationHash !== window.location.hash) {
      handleTabChange(null, typesByTabValue.indexOf(tabLocationHash.replace("#", "")));
      //The timeout is needed to make sure the tab change is done before updating the step.
      setTimeout(() => {
        setStep(nextStep);
      }, 50);
    } else {
      setStep(nextStep);
    }
  };

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
    handleSetStep(0);
  };

  const handleClickForward = ({ isStartingStep }) => {
    const newCookieValue = getNewCookieValue("forward", step);
    cookies.set("finishedTutorialSteps", newCookieValue, {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    const nextStep = getTutorialStepFromCookie(tutorialSteps, newCookieValue, user);
    handleSetStep(!isStartingStep || nextStep > 0 ? nextStep : 1);
  };

  const handleClickBackward = () => {
    const newCookieValue = getNewCookieValue("backward", step);
    cookies.set("finishedTutorialSteps", newCookieValue, {
      path: "/",
      expires: oneYearFromNow,
      sameSite: "lax",
    });
    handleSetStep(getTutorialStepFromCookie(tutorialSteps, newCookieValue, user));
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
    handleSetStep(
      getTutorialStepFromCookie(tutorialSteps, getNewCookieValue("forward", step), user)
    );
  };

  if (!isNarrowScreen) {
    if (step < 0) {
      return (
        <Tooltip
          title={texts.click_here_to_go_back_to_tutorial}
          open={showMinimizedAlert}
          placement="left"
          arrow
        >
          <Button
            variant="contained"
            size="small"
            classes={{
              root: classes.openTutorialButton,
            }}
            onClick={resetSteps}
          >
            {texts.tutorial}
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
