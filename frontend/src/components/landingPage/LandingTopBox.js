import { Container, makeStyles, Typography, useMediaQuery } from "@material-ui/core";
import React from "react";
import theme from "../../themes/theme";
import AlternatingText from "../general/AlternatingText";
import LightBigButton from "../staticpages/LightBigButton";

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    background: `url('/images/landing_image.jpg')`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    position: "relative",
    backgroundPosition: "0px -12vw",
    maxHeight: "80vh",
    [theme.breakpoints.down("md")]: {
      backgroundPosition: "0px -9vw",
    },
    [theme.breakpoints.down("sm")]: {
      backgroundPosition: "0px -6vw",
    },
    [theme.breakpoints.down("xs")]: {
      backgroundSize: "cover",
      backgroundPosition: "0px 0px",
    },
  },
  img: {
    width: "100%",
    maxWidth: 1500,
    visibility: "hidden",
    [theme.breakpoints.down("xs")]: {
      width: "130%",
    },
  },
  textContainer: {
    background: theme.palette.primary.main,
    maxWidth: 600,
    zIndex: 1,
    padding: theme.spacing(4),
    borderRadius: theme.spacing(0.75),
    boxShadow: "5px 5px 5px #00000029",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      padding: theme.spacing(3),
    },
  },
  textContainerWrapper: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: -250,
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
    [theme.breakpoints.down("xs")]: {
      position: "relative",
      bottom: "auto",
      marginTop: -150,
      paddingLeft: 0,
      paddingRight: 0,
    },
    ["@media (max-width: 400px)"]: {
      marginTop: -100,
    },
  },
  bold: {
    fontWeight: "bold",
  },
  lowerWrapper: {
    display: "flex",
    justifyContent: "flex-end",
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: theme.palette.yellow.main,
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      fontSize: 23,
    },
    [theme.breakpoints.down("xs")]: {
      textAlign: "center",
    },
    ["@media (max-width: 500px)"]: {
      fontSize: 17,
    },
  },
  titleTextContainer: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      fontSize: 23,
    },
    [theme.breakpoints.down("xs")]: {
      textAlign: "center",
    },
    ["@media (max-width: 500px)"]: {
      fontSize: 17,
    },
  },
  titleTextFirstLine: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
    ["@media (max-width: 500px)"]: {
      fontSize: 17,
    },
  },
  titleTextSubHeader: {
    marginBottom: theme.spacing(2),
    color: "white",
    fontWeight: 600,
    [theme.breakpoints.down("xs")]: {
      fontSize: 15,
      maxWidth: 375,
      marginBottom: theme.spacing(3),
      textAlign: "center",
      margin: "0 auto",
      ["@media (max-width: 500px)"]: {
        fontWeight: 500,
        fontSize: 18,
        maxWidth: 350,
      },
    },
  },
  exploreButtonContainer: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
  exploreButton: {
    [theme.breakpoints.down("sm")]: {
      height: 50,
    },
    [theme.breakpoints.down("xs")]: {
      height: 40,
      fontSize: 17,
      marginTop: theme.spacing(1),
    },
    ["@media (max-width: 400px)"]: {
      fontSize: 17,
    },
  },
  showMoreIcon: {
    fontSize: 25,
    border: `2px solid white`,
    marginRight: theme.spacing(1),
    color: "white",
    borderRadius: 20,
    height: 23,
    width: 23,
  },
  showMoreText: {
    fontSize: 16,
    color: "white",
  },
  showMoreButtonContainer: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
  showMoreButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(-2),
  },
}));

export default function LandingTopBox() {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <div>
      <div className={classes.imageContainer}>
        <img src="/images/landing_image.jpg" className={classes.img} />
      </div>
      <Container className={classes.textContainerWrapper}>
        <div className={classes.textContainer}>
          <Typography className={classes.titleTextContainer} component="h1">
            <div className={classes.titleTextFirstLine}>
              <AlternatingText classes={classes} mobile={isNarrowScreen} /> climate projects
            </div>
            from around the world
          </Typography>
          {!isNarrowScreen && (
            <Typography component="h2" className={classes.titleTextSubHeader}>
              Join the global climate action network to connect all
              {!isNarrowScreen ? <br /> : " "}
              climate actors on our planet - the only one we have
            </Typography>
          )}
          <div className={classes.exploreButtonContainer}>
            <LightBigButton href="/browse" className={classes.exploreButton}>
              {isNarrowScreen ? "Explore" : "Explore climate projects"}
            </LightBigButton>
          </div>
        </div>
      </Container>
    </div>
  );
}
