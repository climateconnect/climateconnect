import { Chip, makeStyles, Typography } from "@material-ui/core"
import CloseIcon from '@material-ui/icons/Close'
import React, { useState } from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import ClimateMatchHeadline from "./ClimateMatchHeadline"
import QuestionButtonBar from "./QuestionButtonBar"

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  headline: {
    marginBottom: theme.spacing(4),
    textAlign: "center"
  },
  container: {
    flex: "1 1 0px"
  },
  questionAndSelectedAnswersContainer: {
    marginRight: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  selectedAnswerContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2)
  },
  choiceRankText: {
    marginRight: theme.spacing(2),
    fontSize: 25,
    width: 25
  },
  selectedAnswerChip: {
    flexGrow: 1,
    height: 40,
    borderRadius: 20,
    transform: "none !important"
  },
  possibleAnswerContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1)
  },
  listEqualsChar: {
    color: "yellow",
    fontSize: 30,
    marginRight: theme.spacing(1.5)
  },
  possibleAnswerChip: {
    background: theme.palette.primary.light,
    color: "white",
    fontWeight: 600,
    fontSize: 18,
    height: 40,
    borderRadius: 20,
    width: "100%",
    cursor: "pointer"
  },
  alreadySelectedPossibleAnswer: {
    background: "#e0e0e0",
    color: theme.palette.secondary.main
  }
}))

export default function RankingQuestionTypeBody({question, numberOfChoices, answer, onChangeAnswer}) {
  const classes = useStyles()
  console.log(question)
  question.answers.map(a=> console.log(a.name))
  const [selectableAnswers, setSelectableAnswers] = useState(question.answers)
  const onDragEnd = (result) => {
    console.log(result.destination)
    console.log(result)
    if(!result.destination)
      return
    //The user selected an answer!
    if(result.destination.droppableId === "selectedAnswers") {
      if(!answer) {
        console.log(selectableAnswers)
        console.log(selectableAnswers.indexOf(result.source.index))
        onChangeAnswer(question.step, [selectableAnswers[result.source.index]])
      } else {
        console.log(answer)
        const i = result.destination.index
        //insert element at correct place. If there were already 3 elements in the array, cut off after 3
        const newAnswer = [...answer.slice(0, i), selectableAnswers[result.source.index], ...answer.slice(i, answer.length + 1)].slice(0,3)
        onChangeAnswer(question.step, newAnswer)
      }
    }
  }

  console.log(answer)
  console.log(answer?.length > 0)
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>      
        <div className={classes.root}>
          <div className={`${classes.container} ${classes.questionAndSelectedAnswersContainer}`}>
            <ClimateMatchHeadline size="medium" className={classes.headline}>
              {question.question}
            </ClimateMatchHeadline>
            <Droppable 
              droppableId="selectedAnswers"
            >
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >       
                  {
                    [...Array(numberOfChoices)].map((e, i) => (
                      <div key={i} className={classes.selectedAnswerContainer}>
                        <span className={classes.choiceRankText}>{i+1}.</span>
                        {
                          answer?.length >= i+1 ? (    
                            <Draggable key={i} draggableId={"draggable_choice" + i} index={i}>
                              {(provided) => (                        
                                <Chip 
                                  label={answer[i].name}
                                  className={classes.possibleAnswerChip}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                />
                                <CloseIcon />
                              )}
                            </Draggable>
                          ) : (                           
                            <Chip 
                              className={classes.selectedAnswerChip}
                            />                              
                          )
                        }            
                      </div>
                    ))
                  }
                  {provided.placeholder}         
                </div>
              )}
            </Droppable>
            <QuestionButtonBar />
          </div>
          <Droppable droppableId="possibleAnswers" isDropDisabled> 
            {(provided) => (
              <div 
                className={classes.container} 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >                     
                  {selectableAnswers.map((a, index) => (                
                    <div key={a.url_slug} className={classes.possibleAnswerContainer}>
                      <Typography className={classes.listEqualsChar}>=</Typography>
                      {answer?.map(ans => ans.url_slug).includes(a.url_slug) ? (
                        <Chip 
                          label={a.name} 
                          className={`${classes.possibleAnswerChip} ${classes.alreadySelectedPossibleAnswer}`}
                        />
                      ) : (
                        <Draggable 
                          key={a.url_slug} 
                          draggableId={"draggable" + a.url_slug} 
                          index={index}
                        >
                          {(provided) => {
                            return (
                              <Chip 
                                label={a.name} 
                                className={classes.possibleAnswerChip}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              />
                            )
                          }}                    
                        </Draggable>
                      )}                      
                    </div>                
                  ))}
                  {provided.placeholder}           
              </div>
            )}
          </Droppable>
        </div>
      
    </DragDropContext>
  )
}