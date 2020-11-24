import React from "react";
import { Typography, Container, makeStyles, Collapse } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    position: "relative"
  },
  imageContainer: {
    marginTop: theme.spacing(2),
    background: "url('/images/climate-crisis.jpg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    width: "100%"
  },
  img: {
    width: "100%",
    height: "100%",
    visibility: "hidden"
  },
  contentWrapper: {
    background: theme.palette.primary.main,
    marginTop: theme.spacing(-1),
    padding: theme.spacing(2),
    paddingBottom: 0
  },
  subHeader: {
    fontSize: 22,
    fontWeight: 600
  },
  subHeaderWrapper: {
    textAlign: "center",
    color: "white"
  },
  expandMoreIcon: {
    color: "white"
  },
  challengesWrapper: {
    display: "flex",
    position: "relative",
    justifyContent: "space-around",
    paddingLeft: theme.spacing(7),
    paddingRight: theme.spacing(7),
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  challenge: {
    color: "white",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    fontSize: 18,
    width: "33%",
    maxWidth: 330
  },
  thisisWhy: {
    position: "absolute",
    bottom: -41,
    paddingTop: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 25,
    fontWeight: 700
  },
  expandLessIconWrapper: {
    textAlign: "center"
  }
}));

export default function Challenge({ headlineClass, showContent }) {
  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <Typography color="primary" component="h1" className={headlineClass}>
        The Challenge
      </Typography>
      <div>
        <div className={classes.imageContainer}>
          <img src="/images/climate-crisis.jpg" className={classes.img} />
        </div>
        <div className={classes.contentWrapper}>
          <div className={classes.subHeaderWrapper}>
            <Typography component="h1" className={classes.subHeader}>
              Combining approaches to solve the climate crisis worldwide
            </Typography>
            {!showContent && <ExpandMoreIcon className={classes.expandMoreIcon} />}
          </div>
          <Collapse in={showContent} timeout={500}>
            <div className={classes.challengesWrapper}>
              <Typography className={classes.challenge}>
                The climate crisis is the biggest challenge humanity has ever faced - and we can
                only solve it together
              </Typography>
              <Typography className={classes.challenge}>
                Many people are working on very effective climate solutions. We need to spread
                effective solutions globally.
              </Typography>
              <Typography className={classes.challenge}>
                NGOs, companies, governments, public institutions and individuals need to work
                together to solve this crisis.
              </Typography>
            </div>
            {showContent && (
              <div className={classes.expandLessIconWrapper}>
                <ExpandLessIcon className={classes.expandMoreIcon} />
              </div>
            )}
            <Typography color="primary" className={classes.thisisWhy}>
              This is why we created Climate Connect
            </Typography>
          </Collapse>
        </div>
      </div>
    </Container>
  );
}
