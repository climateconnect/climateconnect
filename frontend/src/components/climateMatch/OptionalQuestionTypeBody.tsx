import { Chip, Container, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import climateMatchStyles from "../../../public/styles/climateMatchStyles";
import theme from "../../themes/theme";
import ClimateMatchHeadline from "./ClimateMatchHeadline";
import QuestionButtonBar from "./QuestionButtonBar";

const useStyles = makeStyles<Theme, { image?: string }>((theme) => ({
  ...climateMatchStyles(theme),
  headline: {
    marginTop: theme.spacing(4),
    textAlign: "center",
    ["@media (max-width: 760px)"]: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
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
    [theme.breakpoints.down("md")]: {
      maxWidth: 1000,
    },
  },
  optionalPossibleAnswerChip: {
    width: 500,
    marginBottom: theme.spacing(2),
    ["@media (max-width: 760px)"]: {
      width: "100%",
    },
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
  imageContainer: (props) => ({
    backgroundImage: `url('${props.image}')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPositionX: "center",
    backgroundPositionY: "50%",
    marginLeft: theme.spacing(-4),
    marginRight: theme.spacing(-4),
    height: "calc(100vh - 550px)",
    marginBottom: theme.spacing(1),
  }),
}));

export default function OptionalQuestionTypeBody({ question, handleForwardClick, onBackClick }) {
  const classes = useStyles({
    image: getImageUrl(question.image),
  });
  const answers = question.answers;
  const isSmallerThanSm = useMediaQuery<Theme>(theme.breakpoints.down("md"));

  const handleSelectAnswer = (a) => {
    handleForwardClick(a);
  };

  return (
    <Container className={classes.root}>
      <ClimateMatchHeadline size={isSmallerThanSm ? "tiny" : "medium"} className={classes.headline}>
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
        {isSmallerThanSm && <div className={classes.imageContainer} />}
        <QuestionButtonBar disableForward onBackClick={onBackClick} />
      </div>
    </Container>
  );
}
