import { makeStyles } from "@material-ui/core"
import React from "react"
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
    width: "25%"
  })
}))

export default function ClimateMatchQuestion({questions, step, onChangeAnswer, answer}) {  
  console.log(questions)
  console.log(step)
  const question = questions.find(q => q.step === step)
  const isLastQuestion = questions.indexOfQuestion === questions.length -1
  const classes = useStyles({image: question.image})
  console.log(question)
  return (
    <div className={classes.root}>
      <div className={classes.imageContainer}/>
      {question.type === "select_from_table_values" ? (
        <RankingQuestionTypeBody 
          question={question} 
          numberOfChoices={question.numberOfChoices}
          onChangeAnswer={onChangeAnswer}
          answer={answer}
        />
      ) : question.type === "select_from_custom_answers" && (
        <div>
          tet
        </div>
      )
      }    
    </div>
  )
}