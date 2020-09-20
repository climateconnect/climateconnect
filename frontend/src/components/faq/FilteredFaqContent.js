import React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import FaqQuestionElement from "./FaqQuestionElement";

const useStyles = makeStyles(theme => {
  return {
    root: {
      marginTop: theme.spacing(2)
    },
    header: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottm: theme.spacing(2)
    }
  };
});

export default function FilteredFaqContent({ searchValue, questions }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography className={classes.header}>
        Search results for
        <Typography className={classes.header} component="span" color="primary">
          {' "' + searchValue + '"'}
        </Typography>
      </Typography>
      {questions
        .filter(q => q.question.includes(searchValue))
        .map((q, index) => (
          <FaqQuestionElement key={index} questionObject={q} />
        ))}
    </div>
  );
}
