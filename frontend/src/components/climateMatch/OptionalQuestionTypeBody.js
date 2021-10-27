import { Chip, makeStyles } from "@material-ui/core";
import React, { useState } from "react";
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
}));

export default function OptionalQuestionTypeBody({ question, handleForwardClick, onBackClick }) {
  const classes = useStyles();
  const answers = question.answers;
  console.log(question);
  const [selectedAnswer, setSelectedAnswers] = useState();
  const onSelectAnswer = (answer) => {
    setSelectedAnswers(answer);
  };
  return (
    <div>
      <ClimateMatchHeadline size="medium" className={classes.headline}>
        {question.text}
      </ClimateMatchHeadline>
      <div>
        {answers.map((a, index) => (
          <div key={index} className={classes.answerContainer}>
            <Chip
              label={a.text}
              clickable={true}
              onClick={() =>
                onSelectAnswer({
                  question_id: question.id,
                  predefined_answer_id: a.id,
                  answers: [],
                  answer_type: question.answer_type,
                })
              }
              className={classes.possibleAnswerChip}
            />
          </div>
        ))}
        <QuestionButtonBar
          onForwardClick={() => handleForwardClick(selectedAnswer)}
          onBackClick={onBackClick}
        />
      </div>
    </div>
  );
}
