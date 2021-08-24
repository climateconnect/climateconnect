import { Button, makeStyles, Typography } from "@material-ui/core"
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import React, { useContext } from "react"
import { capitalizeFirstLetter } from "../../../public/lib/parsingOperations"
import getTexts from "../../../public/texts/texts"
import UserContext from "../context/UserContext"
import ClimateMatchButton from "./ClimateMatchButton"
import ClimateMatchHeadline from "./ClimateMatchHeadline"

const useStyles = makeStyles(theme => ({  
  root: {
    position: "relative",
    paddingBottom: theme.spacing(4)
  },  
  nonImageContent: {
    paddingTop: theme.spacing(4),
    maxWidth: 1050,
    margin: "0 auto",
  },
  text:{
    fontSize: 20,
  },
  headline: {
    marginBottom: theme.spacing(4)
  },
  imageContainer: {
    position: "relative",
    display: "block",
    background: "url('/images/erlangen_climatematch.jpg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    marginTop: theme.spacing(4)
  },
  image: {
    visibility: "hidden",
    width: "100%"
  },
  questionsGraphicContainer: {
    width: 1050,
    margin: "0 auto"
  },
  questionsGraphic: {
    position: "absolute",
    top: theme.spacing(2),
    height: `calc(100% - ${theme.spacing(4)}px)`
  },
  backIcon: {
    color: "white"
  },
  buttonBar: {
    width: 1050,
    display: "flex",
    justifyContent: "space-between",
    margin: "0 auto",
    marginTop: theme.spacing(4),
  }
}))

export default function WelcomeToClimateMatch({ goToNextStep, location }) {
  const classes = useStyles()
  const { locale } = useContext(UserContext)
  const texts = getTexts({ page: "climatematch", locale: locale, location: location && capitalizeFirstLetter(location)})

  const handleClickStart = (e) => {
    e.preventDefault()
    goToNextStep()
  }
  return (
    <div className={classes.root}>
      <div className={classes.nonImageContent}>
        <ClimateMatchHeadline className={classes.headline}>
          {texts.welcome_to_climate_match}
        </ClimateMatchHeadline>
        <Typography className={classes.text}>
          {texts.you_are_thinking_about_getting_aktiv_for_climate_action_we_make_it_easy}<br />
          {texts.answer_the_next_four_questions_to_get_suggestions}<br />
          {texts.lets_stop_the_climate_crisis_together_have_fun}
        </Typography>
      </div>
      <div className={classes.imageContainer}>
        <div className={classes.questionsGraphicContainer}>
          <img src="/images/questions_pana.svg" className={classes.questionsGraphic}/>
        </div>
        <img src="/images/erlangen_climatematch.jpg" className={classes.image} />
      </div>
      <div className={classes.buttonBar}>
        <Button className={classes.backIcon}><ArrowBackIosIcon />{texts.back}</Button>
        <ClimateMatchButton wide onClick={handleClickStart}>{texts.start}</ClimateMatchButton>
      </div>
    </div>
  )
}