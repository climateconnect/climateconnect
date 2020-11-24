import React from "react";
import { makeStyles, Typography, Container } from "@material-ui/core";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    position: "relative",
    textAlign: "center"
  },
  openQuoteIcon: {
    marginTop: -35
  },
  closingQuoteIcon: {
    transform: "rotate(180deg)",
    marginBottom: -35
  },
  quoteIconContainer: {
    width: 180,
    display: "flex",
    flexGrow: 1,
    justifyContent: "center"
  },
  closeQuoteIconContainer: {
    alignItems: "flex-end",
    paddingLeft: theme.spacing(3)
  },
  openQuoteIconContainer: {
    alignItems: "flex-start",
    paddingRight: theme.spacing(3)
  },
  quoteIcon: {
    fontSize: 80
  }
}));

export default function Quote({ text, className }) {
  const classes = useStyles();
  return (
    <Container className={`${className} ${classes.root}`}>
      <div className={`${classes.quoteIconContainer} ${classes.openQuoteIconContainer}`}>
        <FormatQuoteIcon
          color="primary"
          className={`${classes.openQuoteIcon} ${classes.quoteIcon}`}
        />
      </div>
      <Typography>{text}</Typography>
      <div className={`${classes.quoteIconContainer} ${classes.closeQuoteIconContainer}`}>
        <FormatQuoteIcon
          color="primary"
          className={`${classes.closingQuoteIcon} ${classes.quoteIcon}`}
        />
      </div>
    </Container>
  );
}
