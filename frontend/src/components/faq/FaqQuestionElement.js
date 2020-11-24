import React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

const useStyles = makeStyles(theme => {
  return {
    root: {
      marginBottom: theme.spacing(1.5),
      borderLeft: `5px solid ${theme.palette.primary.main}`
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
      cursor: "pointer"
    },
    questionText: {
      fontWeight: "bold",
      fontSize: 19,
      width: "100%",
      [theme.breakpoints.down("xs")]: {
        fontSize: 16,
        fontWeight: "normal"
      }
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
      [theme.breakpoints.down("xs")]: {
        fontSize: 16
      }
    }
  };
});

export default function FaqQuestionElement({ questionObject, className }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  return (
    <div className={`${classes.root} ${className}`}>
      <div className={classes.questionWrapper} onClick={() => setOpen(!open)}>
        <Typography component="h3" className={classes.questionText}>
          {questionObject.question}
        </Typography>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </div>
      {open && <div className={classes.answerWrapper}>{questionObject.answer}</div>}
    </div>
  );
}
