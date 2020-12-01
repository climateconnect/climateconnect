import React from "react";
import { makeStyles, Typography, Container } from "@material-ui/core";
import LightBigButton from "./LightBigButton";

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    background: theme.palette.primary.main
  },
  headline: {
    color: "white",
    maxWidth: 580,
    textAlign: "center",
    margin: "0 auto"
  },
  signUpButton: {
    margin: "0 auto"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3)
  },
  yellow: {
    color: theme.palette.yellow.main
  }
}));

export default function StartNowBanner({ h1ClassName, className }) {
  const classes = useStyles();
  return (
    <div className={`${classes.root} ${className}`}>
      <Container>
        <div>
          <Typography className={`${classes.headline} ${h1ClassName}`} component="h1">
            <span className={classes.yellow}>Work together</span>, feel inspired and make a real
            impact <span className={classes.yellow}>on climate change!</span>
          </Typography>
        </div>
        <div className={classes.buttonContainer}>
          <LightBigButton href="/signup" className={classes.signUpButton}>
            Sign up
          </LightBigButton>
        </div>
      </Container>
    </div>
  );
}
