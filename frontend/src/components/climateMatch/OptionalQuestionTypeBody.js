import { Chip, Container, makeStyles } from "@material-ui/core";
import React from "react";
import climateMatchStyles from "../../../public/styles/climateMatchStyles";
import ClimateMatchHeadline from "./ClimateMatchHeadline";
import QuestionButtonBar from "./QuestionButtonBar";

const useStyles = makeStyles((theme) => ({
  ...climateMatchStyles(theme),
  headline: {
    marginTop: theme.spacing(4),
    textAlign: "center",
  },
  answerContainer: {
    textAlign: "center",
    letterSpacing: 0,
    opacity: 1,
  },
  root: {
    maxWidth: 700,
    display: "flex",
    flexDirection: "column",
  },
  optionalPossibleAnswerChip: {
    width: 500,
    marginBottom: theme.spacing(2),
  },
  answersAndButtonsContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(3),
  },
  answerOptionsContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
}));

export default function OptionalQuestionTypeBody({ question, handleForwardClick, onBackClick }) {
  const classes = useStyles();
  const answers = question.answers;

  const handleSelectAnswer = (a) => {
    handleForwardClick(a)
  };

  return (
    <Container className={classes.root}>
      <ClimateMatchHeadline size="medium" className={classes.headline}>
        {question.text}
      </ClimateMatchHeadline>
      <div className={classes.answersAndButtonsContainer}>
        <div className={classes.answerOptionsContainer}>
          {answers.map((a, index) => (
            <div key={index} className={classes.answerContainer}>
              <Chip
                label={a.text}
                clickable={true}
                onClick={() => handleSelectAnswer(a)}
                className={`${classes.possibleAnswerChip} ${classes.optionalPossibleAnswerChip}`}
              />
            </div>
          ))}
        </div>
        <QuestionButtonBar disableForward onBackClick={onBackClick} />
      </div>
    </Container>
  );
}
