import React from "react";
import { Typography, Container, makeStyles, Collapse, useMediaQuery } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    position: "relative",
    paddingLeft: 0,
    paddingRight: 0,
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2)
    }
  },
  imageContainer: {
    marginTop: theme.spacing(2),
    background: "url('/images/wildfire.jpg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      minHeight: 350,
      backgroundSize: "cover",
      backgroundPosition: "-300px 5px"
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: 220,
      backgroundPosition: "-150px 5px"
    },
    [theme.breakpoints.down("xs")]: {
      minHeight: 180
    }
  },
  img: {
    width: "100%",
    height: "100%",
    visibility: "hidden"
  },
  contentWrapper: {
    background: theme.palette.primary.main,
    marginTop: theme.spacing(-1),
    paddingTop: theme.spacing(2)
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
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      paddingLeft: 0,
      paddingTop: theme.spacing(1),
      paddingRight: 0,
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      paddingBottom: 0
    }
  },
  challenge: {
    color: "white",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    fontSize: 18,
    width: "33%",
    maxWidth: 330,
    fontWeight: 600,
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: 600,
      paddingBottom: theme.spacing(3)
    }
  },
  thisisWhy: {
    paddingTop: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    fontSize: 25,
    fontWeight: 600
  },
  expandLessIconWrapper: {
    textAlign: "center"
  },
  marked: {
    color: "yellow",
    fontWeight: 600
  }
}));

export default function Challenge({ headlineClass, showContent, className }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <Container className={`${classes.root} ${className}`}>
      <Typography color="primary" component="h1" className={headlineClass}>
        The Challenge
      </Typography>
      <div>
        <div className={classes.imageContainer}>
          <img src="/images/wildfire.jpg" className={classes.img} />
        </div>
        <div className={classes.contentWrapper}>
          <Container>
            <div className={classes.subHeaderWrapper}>
              {!isNarrowScreen && (
                <Typography component="h1" className={classes.subHeader}>
                  We can only solve the climate crisis through worldwide collaboration
                </Typography>
              )}
              {!showContent && <ExpandMoreIcon className={classes.expandMoreIcon} />}
            </div>
            <Collapse in={showContent} timeout={1000}>
              <div className={classes.challengesWrapper}>
                <Typography className={classes.challenge}>
                  The climate crisis is{" "}
                  <span className={classes.marked}>the biggest challenge</span> humanity has ever
                  faced - and we can only solve it together
                </Typography>
                <Typography className={classes.challenge}>
                  Many people are working on very effective climate solutions. We need to{" "}
                  <span className={classes.marked}>spread effective solutions</span> globally.
                </Typography>
                <Typography className={classes.challenge}>
                  NGOs, companies, governments, public institutions and individuals need to{" "}
                  <span className={classes.marked}>work together</span> to solve this crisis.
                </Typography>
              </div>
              {showContent && (
                <div className={classes.expandLessIconWrapper}>
                  <ExpandLessIcon className={classes.expandMoreIcon} />
                </div>
              )}
            </Collapse>
          </Container>
        </div>
        <Container>
          <Typography color="primary" className={classes.thisisWhy}>
            This is why we created Climate Connect
          </Typography>
        </Container>
      </div>
    </Container>
  );
}
