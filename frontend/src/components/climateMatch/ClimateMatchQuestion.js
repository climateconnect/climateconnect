import { makeStyles } from "@material-ui/core"
import React from "react"
import RankingQuestionTypeBody from "./RankingQuestionTypeBody"
import OptionalQuestionTypeBody from "./OptionalQuestionTypeBody"
import { getImageUrl } from "../../../public/lib/imageOperations"
import QuestionButtonBar from "./QuestionButtonBar"


const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    position: "relative",
    height: "100%"
  },   
  imageContainer: props => ({
    borderRadius: 30,
    background: `url('${props.image}')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPositionX: "center",
    height: 500,
    width: "25%"
  })
}))

export default function ClimateMatchQuestion({
  questions, step, onChangeAnswer, onForwardClick, onBackClick
}) {
  const question = questions.find(q => q.step === step)
  const classes = useStyles({image: getImageUrl(question.image)})
  const answers = question.answers;

  return (
    <div className={classes.root}>
      <div className={classes.imageContainer}/>
      {question.answer_type === "answer" ? (
        <OptionalQuestionTypeBody 
          question={question} 
          onForwardClick={onForwardClick}
          onBackClick={onBackClick}
        />
      ) : (
        <RankingQuestionTypeBody 
          question={question} 
          numberOfChoices={question.number_of_choices}
          onChangeAnswer={onChangeAnswer}
          answers={answers}
          onForwardClick={onForwardClick}
          onBackClick={onBackClick}
        />
      )
      } 
    </div>
  )
}