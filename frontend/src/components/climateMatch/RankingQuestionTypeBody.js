import { Chip, makeStyles, Typography } from "@material-ui/core"
import CloseIcon from '@material-ui/icons/Close'
import React from "react"
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
  },
  closeIcon: {
    cursor: "pointer"
  },
  selectedAnswers: {
    height: 170
  }
}))

export default function RankingQuestionTypeBody({
  step, question, numberOfChoices, answers, onChangeAnswer, handleForwardClick, onBackClick, userAnswer
}) {
  const classes = useStyles()
  // This will be used to set weight for each answer
  const weights = {0: 100, 1: 80, 2: 50}
  const onDragEnd = (result) => {
    if(!result.destination)
      return
    //The user selected an answer!
    if(
      result.destination.droppableId === "selectedAnswers" && 
      userAnswer?.length < numberOfChoices &&
      result.source.droppableId !== result.destination.droppableId
    ) {
      const selectedAnswer = answers[result.source.index]
      const newAnswer = userAnswer
      newAnswer.push({
        'id': selectedAnswer.id,
        'text': selectedAnswer.text,
        'weight': weights[result.destination.index]
      })
      onChangeAnswer(step, newAnswer)
    }
  }

  const onRemoveAnswer = (event, index) => {
    event.preventDefault();
    onChangeAnswer(step, userAnswer.filter((choice, curChoiceIndex) => curChoiceIndex !== index));
  }

  const onForwardClick = () => {
    handleForwardClick()
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
                  className={classes.selectedAnswers}
                >
                  {
                    [...Array(numberOfChoices)].map((e, i) => (
                      <div key={i} className={classes.selectedAnswerContainer}>
                        <span className={classes.choiceRankText}>{i+1}.</span>
                        {
                          userAnswer?.length >= i+1 ? (    
                            <Draggable key={i} draggableId={"draggable_choice" + i} index={i}>
                              {(provided) => (  
                                <>                      
                                  <Chip
                                    label={userAnswer[i].text}
                                    className={classes.possibleAnswerChip}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  />
                                  <CloseIcon className={classes.closeIcon} onClick={(event) => onRemoveAnswer(event, i)}/>
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
            <QuestionButtonBar 
              onForwardClick={onForwardClick}
              onBackClick={onBackClick}
            />
          </div>
          <Droppable droppableId="possibleAnswers" isDropDisabled> 
            {(provided) => (
              <div 
                className={classes.container} 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >                     
                  {answers.map((a, index) => (                
                    <div key={a.id} className={classes.possibleAnswerContainer}>
                      <Typography className={classes.listEqualsChar}>=</Typography>
                        <Draggable 
                          key={a.id} 
                          draggableId={"draggable" + a.id} 
                          index={index}
                          isDragDisabled={userAnswer.map(c=>c.id).includes(a.id)}
                        >
                          {(provided) => {
                            return (
                              <Chip 
                                label={a.text} 
                                className={classes.possibleAnswerChip}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                disabled={userAnswer.map(c=>c.id).includes(a.id)}
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