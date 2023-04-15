import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import React, { useState } from "react";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      marginBottom: theme.spacing(1.5),
      borderLeft: `5px solid ${theme.palette.primary.main}`,
    },
    questionWrapper: {
      width: "100%",
      backgroundColor: "#2071781A",
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
    },
    questionText: {
      fontWeight: "bold",
      fontSize: 19,
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        fontSize: 16,
        fontWeight: "normal",
      },
    },
    answerWrapper: {
      width: "100%",
      backgroundColor: "#F2F2F2",
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      fontSize: 17,
      lineHeight: 1.5,
      [theme.breakpoints.down("sm")]: {
        fontSize: 16,
      },
    },
  };
});

export default function FaqQuestionElement({
  questionObject,
  className,
  questionTextClassName,
}: any) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <div className={className ? `${classes.root} ${className}` : `${classes.root}`}>
      <div className={classes.questionWrapper} onClick={() => setOpen(!open)}>
        <Typography
          component="h3"
          className={
            questionTextClassName
              ? `${classes?.questionText} ${questionTextClassName}`
              : classes.questionText
          }
        >
          {questionObject.question}
        </Typography>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </div>
      {open && <div className={classes.answerWrapper}>{questionObject.answer}</div>}
    </div>
  );
}
