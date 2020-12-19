import React from "react";
import { makeStyles, Typography, Container } from "@material-ui/core";
import HoverImage from "../HoverImage";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  textBlock: {
    color: "white",
    fontWeight: 600,
    [theme.breakpoints.down("sm")]: {
      textAlign: "center",
      fontWeight: 500,
      fontSize: 18,
      marginTop: theme.spacing(3),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  textWrapper: {
    marginRight: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginTop: theme.spacing(3),
    },
  },
  imageWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    flexGrow: 1,
    padding: theme.spacing(6),
    maxHeight: 300,
    [theme.breakpoints.down("sm")]: {
      maxHeight: 400,
      padding: 0,
      marginTop: theme.spacing(7),
      marginBottom: theme.spacing(7),
      paddingRight: theme.spacing(3),
      width: "80%",
      maxWidth: 630,
    },
  },
  hoverImage: {
    width: 300,
    height: 200,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      height: "auto",
    },
  },
}));

export default function Born({ className, headlineClass }) {
  const classes = useStyles();
  return (
    <div className={`${classes.root} ${className}`}>
      <Container className={classes.wrapper}>
        <div className={classes.textWrapper}>
          <Typography component="h1" className={headlineClass}>
            Climate Connect was born
          </Typography>
          <Typography className={classes.textBlock}>
            The idea of Climate Connect was born after a local networking event in Chris and Tobis
            home town Erlangen, Germany. After the event it was very obivous that not a lot of
            people knew each other or worked together before. The idea was born to bring this
            approach to a global level, and to include as many people as possible to fight climate
            change together.
          </Typography>
        </div>
        <div className={classes.imageWrapper}>
          <HoverImage
            src="/images/networking-event.jpg"
            text="The idea of Climate Connect was born after the success of this event, which resulted in the creation of a Climate action concept for the University in Erlangen"
            className={classes.hoverImage}
          />
        </div>
      </Container>
    </div>
  );
}
