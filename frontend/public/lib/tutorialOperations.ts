import Cookies from "universal-cookie";

export function getTutorialStepFromCookie(tutorialSteps, cookieContent, user) {
  if (cookieContent) {
    if (parseInt(cookieContent) === -1) return -1;
    const now = new Date();
    const oneYearFromNow = new Date(now.setFullYear(now.getFullYear() + 1));
    const cookies = new Cookies();
    const url = window.location.href;
    const completedSteps = cookieContent.split(",").map((s) => parseInt(s));
    const uncompletedStepsOnUrl = tutorialSteps
      .filter((step) => {
        //short circuit if step has already been completed
        if (completedSteps.includes(step.step)) return false;
        for (const page of step.pages) {
          if (url.includes(page)) {
            if (
              step.loggedIn === undefined ||
              (step.loggedIn === true && user) ||
              (step.loggedIn === false && !user)
            )
              return true;
          }
        }
        return false;
      })
      .sort((a, b) => a.step - b.step);
    if (uncompletedStepsOnUrl?.length === 0) {
      cookies.set("lastStepBeforeSkipTutorial", completedSteps[completedSteps.length - 1], {
        path: "/",
        expires: oneYearFromNow,
        sameSite: "lax",
      });
      return -1;
    }
    return uncompletedStepsOnUrl[0].step;
  } else {
    return 0;
  }
}

export function getLastCompletedTutorialStep(cookieContent) {
  if (!cookieContent) return;
  const completedSteps = cookieContent.split(",").map((s) => parseInt(s));
  if (completedSteps && completedSteps.length) return completedSteps[completedSteps.length - 1];
  else return -1;
}

export function getLastStepBeforeSkip(cookieContent) {
  if (!cookieContent) return 0;
  return parseInt(cookieContent);
}
