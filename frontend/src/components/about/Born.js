import React from "react";
import { makeStyles, Typography, Container } from "@material-ui/core";
import HoverImage from "../staticpages/HoverImage";

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.primary.main
  },
  wrapper: {
    display: "flex",
    alignItems: "center"
  },
  textBlock: {
    color: "white",
    fontWeight: 600
  },
  textWrapper: {
    marginRight: theme.spacing(3),
    maxWidth: 630
  },
  imageWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    flexGrow: 1,
    padding: theme.spacing(6),
    maxHeight: 300
  },
  hoverImage: {
    width: 300,
    height: 200
  }
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
            The Idea of Climate Connect was born after a local networking event in Chris and Tobis
            Homtown Erlangen, Germany. After the event it was very obivous that not a lot of people
            knew each other or worked together before. The Idea was born to bring this approach to a
            global level. Include as many people as possible to fight climate change together.
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
