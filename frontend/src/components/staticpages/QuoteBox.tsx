import React from "react";
import { Container } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Quote from "./Quote";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  text: {
    color: "white",
  },
  quoteIcon: {
    color: theme.palette.primary.light,
  },
}));

export default function QuoteBox({ text, className }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Container>
        <Quote
          className={className}
          text={text}
          textClassName={classes.text}
          quoteIconClassName={classes.quoteIcon}
          noPadding
        />
      </Container>
    </div>
  );
}
