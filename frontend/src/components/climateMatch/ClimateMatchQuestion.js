import { makeStyles } from "@material-ui/core"
import React from "react"
import RankingQuestionTypeBody from "./RankingQuestionTypeBody"
import { getAllHubs } from "../../../public/lib/hubOperations"
import { getSkillsOptions } from '../../../public/lib/getOptions'

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

export default function ClimateMatchQuestion({questions, step, onChangeAnswer, locale}) {
  const question = questions.find(q => q.step === step)
  const isLastQuestion = questions.indexOfQuestion === questions.length -1
  const classes = useStyles({image: question.image})
  const answers = getAnswers(question, locale)
  console.log(question)
  return (
    <div className={classes.root}>
      <div className={classes.imageContainer}/>
      {question.answer_type === "answer" ? (<div>test</div>) : (
        <RankingQuestionTypeBody 
          question={question} 
          numberOfChoices={question.numberOfChoices}
          onChangeAnswer={onChangeAnswer}
          answers={answers}
        />
      )
      }    
    </div>
  )
}

const getAnswers = async (question, locale) => {
  let data = null;
  if(question.answer_type == 'hub') {
    data = await getAllHubs(locale, true)
  } else if (question.answer_type == 'skill') {
    data = await getSkillsOptions(locale)
  } else {
    data = question.predefined_answers
  }

  return data;
}