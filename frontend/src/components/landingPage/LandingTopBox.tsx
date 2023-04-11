import { Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import AlternatingText from "../general/AlternatingText";
import LightBigButton from "../staticpages/LightBigButton";

const useStyles = makeStyles<Theme, { imageSource: string }>((theme) => ({
  imageContainer: (props) => ({
    background: `url('/images/${props.imageSource}')`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    position: "relative",
    backgroundPosition: "0px -12vw",
    maxHeight: "80vh",
    [theme.breakpoints.down("lg")]: {
      backgroundPosition: "0px -9vw",
    },
    [theme.breakpoints.down("md")]: {
      backgroundPosition: "0px -6vw",
    },
    [theme.breakpoints.down("sm")]: {
      backgroundSize: "cover",
      backgroundPosition: "0px 0px",
    },
  }),
  img: {
    width: "100%",
    maxWidth: 1500,
    visibility: "hidden",
    [theme.breakpoints.down("sm")]: {
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
    [theme.breakpoints.down("sm")]: {
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
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
    [theme.breakpoints.down("sm")]: {
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
    [theme.breakpoints.down("md")]: {
      fontSize: 23,
    },
    [theme.breakpoints.down("sm")]: {
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
    [theme.breakpoints.down("md")]: {
      fontSize: 23,
    },
    [theme.breakpoints.down("sm")]: {
      textAlign: "center",
    },
    ["@media (max-width: 500px)"]: {
      fontSize: 17,
    },
  },
  titleTextFirstLine: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
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
    [theme.breakpoints.down("sm")]: {
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
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  },
  exploreButton: {
    [theme.breakpoints.down("md")]: {
      height: 50,
    },
    [theme.breakpoints.down("sm")]: {
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
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  },
  showMoreButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(-2),
  },
}));

export default function LandingTopBox() {
  const { locale } = useContext(UserContext);

  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const isVeryLargeScreen = useMediaQuery<Theme>(theme.breakpoints.up("lg"));
  const imageSource = isNarrowScreen
    ? "landing_image_small.jpg"
    : isVeryLargeScreen
    ? "landing_image_extra_large.jpg"
    : "landing_image_extra_large.jpg";
  const classes = useStyles({ imageSource: imageSource });
  const texts = getTexts({
    page: "landing_page",
    locale: locale,
    classes: classes,
    isNarrowScreen: isNarrowScreen,
  });
  return (
    <div>
      <div className={classes.imageContainer}>
        <img
          src={`/images/${imageSource}`}
          alt={texts.landing_page_photo_alt}
          className={classes.img}
        />
      </div>
      <Container className={classes.textContainerWrapper}>
        <div className={classes.textContainer}>
          <Typography className={classes.titleTextContainer} component="h1">
            <div className={classes.titleTextFirstLine}>
              <AlternatingText classes={classes} mobile={isNarrowScreen} />
            </div>
            {texts.from_around_the_world}
          </Typography>
          {!isNarrowScreen && (
            <Typography component="h2" className={classes.titleTextSubHeader}>
              {texts.landing_page_text}
            </Typography>
          )}
          <div className={classes.exploreButtonContainer}>
            <LightBigButton
              href={getLocalePrefix(locale) + "/browse"}
              className={classes.exploreButton}
            >
              {isNarrowScreen ? texts.explore : texts.explore_climate_projects}
            </LightBigButton>
          </div>
        </div>
      </Container>
    </div>
  );
}
