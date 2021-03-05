export function getTutorialStepFromCookie(tutorialSteps, cookieContent){
  if(cookieContent){
    const url = window.location.href
    const completedSteps = cookieContent.split(",").map(s => parseInt(s))
    const uncompletedStepsOnUrl = tutorialSteps.filter(step => {
      //short circuit if step has already been completed
      if(completedSteps.includes(step.step))
        return false
      for(const page of step.pages){
        if(url.includes(page)){
          return true
        }
      }
      return false
    }).sort((a, b) => a.step - b.step)  
    return uncompletedStepsOnUrl[0].step
  } else {
    return 0
  }
}

export function getLastCompletedTutorialStep(cookieContent) {
  if(!cookieContent)
    return
  const completedSteps = cookieContent.split(",").map(s => parseInt(s))
  if(completedSteps && completedSteps.length)
    return completedSteps[completedSteps.length -1]
  else
    return -1
}

export function getLastStepBeforeSkip(cookieContent) {
  if(!cookieContent)
    return 0
  return parseInt(cookieContent)
}