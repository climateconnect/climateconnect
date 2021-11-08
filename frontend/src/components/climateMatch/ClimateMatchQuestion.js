import { makeStyles } from "@material-ui/core";
import React from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import OptionalQuestionTypeBody from "./OptionalQuestionTypeBody";
import RankingQuestionTypeBody from "./RankingQuestionTypeBody";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    position: "relative",
    height: "100%",
  },
  imageContainer: (props) => ({
    borderRadius: 30,
    backgroundImage: `url('${props.image}')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPositionX: "center",
    backgroundPositionY: props.questionType === "optional" ? "bottom" : "auto",
    height: 500,
    minWidth: props.questionType === "optional" ? 400 : 300,
    [theme.breakpoints.down("md")]: {
      minWidth: props.questionType !== "optional" && 200,
    },
    [theme.breakpoints.down("sm")]: {
      display:  "none"
    }
  }),
  optionalQuestionImageContainer: {
    minWidth: 700,
  },
}));

export default function ClimateMatchQuestion({
  questions,
  step,
  userAnswers,
  onChangeAnswer,
  handleForwardClick,
  onBackClick,
}) {
  const question = questions.find((q) => q.step === step);
  const classes = useStyles({
    image: getImageUrl(question.image),
    questionType: question.answer_type === "answer" ? "optional" : "ranking",
  });
  const answers = question.answers;

  return (
    <div className={classes.root}>
      {question.answer_type === "answer" ? (
        <>
          <div className={classes.imageContainer} />
          <OptionalQuestionTypeBody
            question={question}
            handleForwardClick={handleForwardClick}
            onBackClick={onBackClick}
            userAnswer={userAnswers[step - 1]}
          />
        </>
      ) : (
        <>
          <div className={classes.imageContainer} />
          <RankingQuestionTypeBody
            question={question}
            step={step}
            numberOfChoices={question.number_of_choices}
            onChangeAnswer={onChangeAnswer}
            answers={answers}
            handleForwardClick={handleForwardClick}
            onBackClick={onBackClick}
            userAnswer={userAnswers[step - 1]}
          />
        </>
      )}
    </div>
  );
}
