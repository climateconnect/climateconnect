import React from "react";
import { Typography, Container, makeStyles } from "@material-ui/core";
import ExplainerElement from "../ExplainerElement";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(6)
  },
  wrapper: {
    display: "flex",
    marginTop: theme.spacing(3),
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
      height: 300
    }
  },
  imageOuterWrapper: {
    width: "50%",
    paddingLeft: theme.spacing(15),
    paddingRight: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      position: "absolute",
      width: 325,
      height: 300,
      padding: 0,
      marginLeft: "auto",
      marginRight: "auto",
      background: "white"
    }
  },
  imageWrapper: {
    maxWidth: "100%",
    maxHeight: "100%",
    background: "url('/images/about-goal.svg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain"
  },
  image: {
    width: "100%",
    height: "100%",
    visibility: "hidden"
  },
  explainerElementsWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    paddingRight: theme.spacing(15),
    paddingLeft: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
      justifyContent: "space-between",
      height: "100%",
      background: "rgba(255,255,255,0.9)",
      zIndex: 1
    }
  }
}));

export default function Goals({ headlineClass }) {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <Typography color="primary" component="h1" className={headlineClass}>
        Our Goals
      </Typography>
      <div className={classes.wrapper}>
        <div className={classes.imageOuterWrapper}>
          <div className={classes.imageWrapper}>
            <img src="/images/about-goal.svg" className={classes.image} />
          </div>
        </div>
        <div className={classes.explainerElementsWrapper}>
          <ExplainerElement
            text={
              <>
                <b>Connect Everyone Working On Climate Action</b>
              </>
            }
            horizontal
            icon="/icons/floating_sign_group.svg"
            alt="Group of People icon"
          />
          <ExplainerElement
            text={
              <>
                <b>Accelerate Climate Action Worldwide</b>
              </>
            }
            horizontal
            icon="/icons/floating_sign_group.svg"
            alt="Group of People icon"
          />
          <ExplainerElement
            text={
              <>
                <b>One Platform For All Climate Actors</b>
              </>
            }
            horizontal
            icon="/icons/floating_sign_group.svg"
            alt="Group of People icon"
          />
        </div>
      </div>
    </Container>
  );
}
