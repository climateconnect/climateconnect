import React from "react";
import { Typography, Container, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

const useStyles = makeStyles<Theme, { noPadding?: boolean }>((theme) => ({
  root: {
    display: "flex",
    position: "relative",
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  openQuoteIcon: {
    marginTop: -35,
  },
  closingQuoteIcon: {
    transform: "rotate(180deg)",
    marginBottom: -35,
  },
  quoteIconContainer: {
    width: 180,
    display: "flex",
    flexGrow: 1,
    justifyContent: "center",
  },
  closeQuoteIconContainer: (props) => ({
    alignItems: "flex-end",
    paddingLeft: props.noPadding ? 0 : theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      marginLeft: "auto",
      display: "flex",
      justifyContent: "flex-end",
    },
  }),
  openQuoteIconContainer: (props) => ({
    alignItems: "flex-start",
    paddingRight: props.noPadding ? 0 : theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      justifyContent: "flex-start",
    },
  }),
  quoteIcon: {
    fontSize: 80,
  },
  textBody: {
    [theme.breakpoints.down("sm")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  },
}));

export default function Quote({
  text,
  className,
  textClassName,
  quoteIconClassName,
  noPadding,
}: any) {
  const classes = useStyles({ noPadding: noPadding });
  return (
    <Container className={`${className} ${classes.root}`}>
      <div className={`${classes.quoteIconContainer} ${classes.openQuoteIconContainer}`}>
        <FormatQuoteIcon
          color="primary"
          className={`${classes.openQuoteIcon} ${classes.quoteIcon} ${quoteIconClassName}`}
        />
      </div>
      <Typography className={`${classes.textBody} ${textClassName}`}>{text}</Typography>
      <div className={`${classes.quoteIconContainer} ${classes.closeQuoteIconContainer}`}>
        <FormatQuoteIcon
          color="primary"
          className={`${classes.closingQuoteIcon} ${classes.quoteIcon} ${quoteIconClassName}`}
        />
      </div>
    </Container>
  );
}
