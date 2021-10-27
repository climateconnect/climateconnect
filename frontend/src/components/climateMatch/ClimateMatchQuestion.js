import { makeStyles } from "@material-ui/core"
import React from "react"
import { getImageUrl } from "../../../public/lib/imageOperations"
import OptionalQuestionTypeBody from "./OptionalQuestionTypeBody"
import RankingQuestionTypeBody from "./RankingQuestionTypeBody"


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
    minWidth: 300
  })
}))

export default function ClimateMatchQuestion({
  questions, step, userAnswers, onChangeAnswer, handleForwardClick, onBackClick
}) {
  const question = questions.find(q => q.step === step)
  const classes = useStyles({image: getImageUrl(question.image)})
  const answers = question.answers;
  console.log(userAnswers);

  return (
    <div className={classes.root}>
      <div className={classes.imageContainer}/>
      {question.answer_type === "answer" ? (
        <OptionalQuestionTypeBody 
          question={question} 
          handleForwardClick={handleForwardClick}
          onBackClick={onBackClick}
        />
      ) : (
        <RankingQuestionTypeBody 
          question={question} 
          numberOfChoices={question.number_of_choices}
          onChangeAnswer={onChangeAnswer}
          answers={answers}
          handleForwardClick={handleForwardClick}
          onBackClick={onBackClick}
        />
      )
      } 
    </div>
  )
}