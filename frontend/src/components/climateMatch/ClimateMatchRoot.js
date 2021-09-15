import { Container, makeStyles } from "@material-ui/core"
import React, { useContext, useEffect, useState } from "react"
import getMockClimateMatchQuestions from "../../../public/data/mockClimateMatchQuestions"
import { getSkillsOptions } from "../../../public/lib/getOptions"
import { getAllHubs } from "../../../public/lib/hubOperations"
import getTexts from "../../../public/texts/texts"
import UserContext from "../context/UserContext"
import LoadingSpinner from "../general/LoadingSpinner"
import ClimateMatchQuestion from "./ClimateMatchQuestion"
import WelcomeToClimateMatch from "./WelcomeToClimateMatch"
import { apiRequest } from "../../../public/lib/apiOperations"
import Cookies from 'universal-cookie';

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
  const { locale } = useContext(UserContext)
  const texts = getTexts({page: "climatematch", locale: locale})
  const [step, setStep] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [location, setLocation] = useState(null)
  const [userAnswers, setUserAnswers] = useState([])
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

  const handleForwardClick = () => {
    if(step < totalQuestions) {
      setStep(step + 1);
    } else {
      console.log("All questions over")
    }
  }

  const handleChangeAnswers = (step, newAnswer) => (
    setUserAnswers([...userAnswers.splice(0, step), newAnswer, ...userAnswers.slice(newAnswer+1, newAnswer.length)])
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
            onChangeAnswer={handleChangeAnswers}
            onForwardClick={handleForwardClick}
          />
        )      
      }
    </Container>
  )
}

const getQuestions = async (token, locale, location) => {
  if(token) {
    try {
      const resp = await apiRequest({
        method: "get",
        url: "/api/questions/",
        locale: locale,
        token: token
      })
      return resp.data;
    } catch(e) {
      console.log(e)
    }
  } else {
    return null;
  }
  //"location" determines what images to show and could lead to different questions
}