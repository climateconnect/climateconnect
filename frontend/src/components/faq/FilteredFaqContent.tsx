import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FaqQuestionElement from "./FaqQuestionElement";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      marginTop: theme.spacing(2),
    },
    header: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottm: theme.spacing(2),
    },
  };
});

export default function FilteredFaqContent({ searchValue, questions }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "faq", locale: locale });
  return (
    <div className={classes.root}>
      <Typography className={classes.header}>
        {texts.search_results_for}
        <Typography className={classes.header} component="span" color="primary">
          {' "' + searchValue + '"'}
        </Typography>
      </Typography>
      {questions
        .filter((q) => q.question.toLowerCase().includes(searchValue.toLowerCase()))
        .map((q, index) => (
          <FaqQuestionElement key={index} questionObject={q} />
        ))}
    </div>
  );
}
