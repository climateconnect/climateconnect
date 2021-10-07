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

export default function RankingQuestionTypeBody({
  question, numberOfChoices, answers, onChangeAnswer, onForwardClick, onBackClick
}) {
  const classes = useStyles()
  // This will be used to set weight for each answer
  const weights = {0: 100, 1: 80, 2: 50}
  const [selectableAnswers, setSelectableAnswers] = useState(answers)
  const [possibleAnswers, setPossibleAnswers] = useState([])
  const onDragEnd = (result) => {
    console.log(result);
    if(!result.destination)
      return
    //The user selected an answer!
    if(
      result.destination.droppableId === "selectedAnswers" && 
      possibleAnswers.length < numberOfChoices &&
      result.source.droppableId !== result.destination.droppableId
    ) {
      console.log("dip")
      console.log(selectableAnswers, possibleAnswers);
      const selectedAnswer = selectableAnswers[result.source.index]
      const newPossibleAnswers = possibleAnswers
      newPossibleAnswers.push({
        'id': selectedAnswer.id,
        'text': selectedAnswer.text,
        'weight': weights[result.destination.index]
      })
    }
  }

  const onCloseIcon = (event, index) => {
    event.preventDefault();
    console.log("dips")
    const newPossibleAnswers = possibleAnswers;
    newPossibleAnswers.splice(index);
    setPossibleAnswers(newPossibleAnswers);
  }
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>      
        <div className={classes.root}>
          <div className={`${classes.container} ${classes.questionAndSelectedAnswersContainer}`}>
            <ClimateMatchHeadline size="medium" className={classes.headline}>
              {question.text}
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
                          possibleAnswers?.length >= i+1 ? (    
                            <Draggable key={i} draggableId={"draggable_choice" + i} index={i}>
                              {(provided) => (  
                                <>                      
                                  <Chip
                                    label={possibleAnswers[i].text}
                                    className={classes.possibleAnswerChip}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  />
                                  <CloseIcon onClick={(event) => onCloseIcon(event, i)}/>
                                </>
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
            <QuestionButtonBar onForwardClick={onForwardClick} onBackClick={onBackClick}/>
          </div>
          <Droppable droppableId="possibleAnswers" isDropDisabled> 
            {(provided) => (
              <div 
                className={classes.container} 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >                     
                  {selectableAnswers.map((a, index) => (                
                    <div key={a.id} className={classes.possibleAnswerContainer}>
                      <Typography className={classes.listEqualsChar}>=</Typography>
                        <Draggable 
                          key={a.id} 
                          draggableId={"draggable" + a.id} 
                          index={index}
                        >
                          {(provided) => {
                            return (
                              <Chip 
                                label={a.text} 
                                className={classes.possibleAnswerChip}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              />
                            )
                          }}                    
                        </Draggable>                      
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