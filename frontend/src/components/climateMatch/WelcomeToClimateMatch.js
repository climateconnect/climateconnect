import { Button, Container, makeStyles, Typography, useMediaQuery } from "@material-ui/core";
import RestoreIcon from '@material-ui/icons/Restore';
import React, { useContext, useRef } from "react";
import { capitalizeFirstLetter } from "../../../public/lib/parsingOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import ElementOnScreen from "../hooks/ElementOnScreen";
import ClimateMatchButton from "./ClimateMatchButton";
import ClimateMatchHeadline from "./ClimateMatchHeadline";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.down("xs")]: {
      paddingBottom: theme.spacing(2),
    },
  },
  nonImageContent: {
    paddingTop: theme.spacing(4),
    maxWidth: 1050,
    margin: "0 auto",
    [theme.breakpoints.down("xs")]: {
      paddingTop: theme.spacing(2),
    },
  },
  text: {
    fontSize: 20,
  },
  headline: {
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down("xs")]: {
      marginBottom: theme.spacing(2),
    },
  },
  imageContainer: {
    position: "relative",
    display: "block",
    background: "url('/images/erlangen_climatematch.jpg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    marginTop: theme.spacing(4),
  },
  image: {
    visibility: "hidden",
    width: "100%",
  },
  questionsGraphicContainer: {
    width: "100%",
    maxWidth: 1050,
    margin: "0 auto",
  },
  questionsGraphic: {
    position: "absolute",
    top: theme.spacing(2),
    height: `calc(100% - ${theme.spacing(4)}px)`,
  },
  lastResultIcon: {
    color: "white",
    marginRight: theme.spacing(0.5)
  },
  buttonBar: {
    width: "100%",
    maxWidth: 1050,
    display: "flex",
    justifyContent: "space-between",
    margin: "0 auto",
    marginTop: theme.spacing(4),
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(1),
    },
  },
  fixedOnMobile: {
    [theme.breakpoints.down("xs")]: {
      position: "fixed",
      bottom: 0,
      width: "auto",
      left: theme.spacing(0),
      right: theme.spacing(0),
      backgroundColor: theme.palette.primary.main,
    },
  },
  buttonBarPlaceholder: (props) => ({
    height: !props.unfixButtonBar && 55,
  }),
  lastResultButton: {
    color: "white"
  },
  buttonBarLeft: {
    alignItems: "center",
    display: "flex"
  }
}));

export default function WelcomeToClimateMatch({ goToNextStep, location, hasDoneClimateMatch }) {
  const bottomRef = useRef(null);
  const unfixButtonBar = ElementOnScreen({
    el: bottomRef.current,
    minSpaceFromBottom: 55,
  });
  const classes = useStyles({ unfixButtonBar: unfixButtonBar });
  const { locale } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const texts = getTexts({
    page: "climatematch",
    locale: locale,
    location: location && capitalizeFirstLetter(location),
  });

  const handleClickStart = (e) => {
    e.preventDefault();
    goToNextStep();
  };

  return (
    <div className={classes.root}>
      <Container className={classes.nonImageContent}>
        <ClimateMatchHeadline className={classes.headline} size={isNarrowScreen && "tiny"}>
          {texts.welcome_to_climate_match}
        </ClimateMatchHeadline>
        <Typography className={classes.text}>
          {texts.you_are_thinking_about_getting_aktiv_for_climate_action_we_make_it_easy}
          <br />
          {texts.answer_the_next_four_questions_to_get_suggestions}
          <br />
          {texts.lets_stop_the_climate_crisis_together_have_fun}
        </Typography>
      </Container>
      <div className={classes.imageContainer} ref={bottomRef}>
        <div className={classes.questionsGraphicContainer}>
          <img src="/images/questions_pana.svg" className={classes.questionsGraphic} />
        </div>
        <img src="/images/erlangen_climatematch.jpg" className={classes.image} />
      </div>
      <Container className={`${classes.buttonBar} ${!unfixButtonBar && classes.fixedOnMobile}`}>
        <div className={classes.buttonBarLeft}>
          {hasDoneClimateMatch && (
            <Button href="/climatematchresults" className={classes.lastResultButton}>
              <RestoreIcon className={classes.lastResultIcon}/>
              {texts.your_last_result}
            </Button>
          )}
        </div>
        <ClimateMatchButton wide={!isNarrowScreen} onClick={handleClickStart}>
          {texts.start}
        </ClimateMatchButton>
      </Container>
    </div>
  );
}
