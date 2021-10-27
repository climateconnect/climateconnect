import { Container, makeStyles } from "@material-ui/core"
import Router from "next/router"
import React, { useContext, useEffect, useState } from "react"
import Cookies from 'universal-cookie'
import { apiRequest } from "../../../public/lib/apiOperations"
import getTexts from "../../../public/texts/texts"
import UserContext from "../context/UserContext"
import LoadingSpinner from "../general/LoadingSpinner"
import ClimateMatchQuestion from "./ClimateMatchQuestion"
import WelcomeToClimateMatch from "./WelcomeToClimateMatch"

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.primary.main,
    marginTop: theme.spacing(-2),
    color: "white",
    borderRadius: theme.spacing(4),    
    fontFamily: "flood-std, sans-serif",
    fontStyle: "normal",
    paddingLeft: 0,
    paddingRight: 0,
    position: "relative",
  },
  loadingOverlay: {
    background: theme.palette.primary.main,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.spacing(4),
    zIndex: 10,
    display: "flex",
    alignItems: "center"
  },
}))

export default function ClimateMatchRoot() {
  const classes = useStyles()  
  const { locale, user  } = useContext(UserContext)
  const texts = getTexts({page: "climatematch", locale: locale})
  const [step, setStep] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [location, setLocation] = useState(null)
  const [userAnswers, setUserAnswers] = useState({'user_question_answers': []})
  const cookies = new Cookies();
  const token = cookies.get('token');

  //get initial props after the page loaded
  useEffect(async function () {
    //getHubClimateMatchInfo if ?location="..." is set in the url
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if(params.location)
      setLocation(params.location)
    const retrievedQuestionsData = await getQuestions(token, locale, params.location)
    setQuestions(retrievedQuestionsData.results)
    setTotalQuestions(retrievedQuestionsData.total_questions)
    setIsLoading(false)
  }, [])

  const goToNextStep = () => {
    setStep(step+1)
  }

  const submitUserQuestionAnswerForClimateMatch = (userAnswers, token, locale) => {
    apiRequest({
      method: "post",
      url: `/api/members/${user.url_slug}/question_answers/`,
      payload: userAnswers,
      token: token,
      locale: locale
    }).then(function (response) {
      console.log(response.data);
      Router.push('/climatematchedresources');
    }).catch(function (error) {
      console.log(error);
    })
  }

  const handleForwardClick = (userQnA) => {
    // Set user answers for climate match
    const newUserAnswers = userAnswers
    newUserAnswers['user_question_answers'].push(userQnA)
    setUserAnswers(newUserAnswers);

    if(step < totalQuestions) {
      setStep(step + 1);
    } else {
      submitUserQuestionAnswerForClimateMatch(userAnswers, token, locale);
    }
  }

  const handleBackClick = () => {
    if(step > 0) {
      setStep(step - 1);
    }
  }

  const handleChangeAnswers = (step, newAnswer) => (
    setUserAnswers([
      ...userAnswers.splice(0, step), 
      newAnswer, 
      ...userAnswers.slice(newAnswer+1, newAnswer.length)
    ])
  )
  return (
    <Container className={classes.root}>
      {isLoading && (
        <div className={classes.loadingOverlay}>
          <LoadingSpinner isLoading color="#fff" noMarginTop message={texts.loading_the_climatematch}/>
        </div>
      )}
      {
        step === 0 ? (
          //In the beginning we don't know the hub name and background picture of welcomeToClimateMatch yet
          //We still load the component in loading state because we need to know the height of the container
          <WelcomeToClimateMatch isLoading={isLoading} goToNextStep={goToNextStep} location={location}/>
        ) : (
          <ClimateMatchQuestion 
            questions={questions}
            step={step}
            userAnswers={userAnswers}
            onChangeAnswer={handleChangeAnswers}
            handleForwardClick={handleForwardClick}
            onBackClick={handleBackClick}
          />
        )      
      }
    </Container>
  )
}

const getQuestions = async (token, locale, location) => {
  // TODO (Dip): Check about location logic here
  // "location" determines what images to show and could lead to different questions
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/questions/",
      locale: locale,
      token: token,
      location: location
    })
    return resp.data;
  } catch(e) {
    console.log(e)
  }
}
