import { Collapse, Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    position: "relative",
    paddingLeft: 0,
    paddingRight: 0,
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(2),
    },
  },
  imageContainer: {
    marginTop: theme.spacing(2),
    background: "url('/images/wildfire.jpg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    width: "100%",
    [theme.breakpoints.down("lg")]: {
      minHeight: 350,
      backgroundSize: "cover",
      backgroundPosition: "-300px 5px",
    },
    [theme.breakpoints.down("md")]: {
      minHeight: 220,
      backgroundPosition: "-150px 5px",
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: 180,
    },
  },
  img: {
    width: "100%",
    height: "100%",
    visibility: "hidden",
  },
  contentWrapper: {
    background: theme.palette.primary.main,
    marginTop: theme.spacing(-1),
    paddingTop: theme.spacing(2),
  },
  subHeader: {
    fontSize: 22,
    fontWeight: 600,
  },
  subHeaderWrapper: {
    textAlign: "center",
    color: "white",
  },
  expandMoreIcon: {
    color: "white",
  },
  challengesWrapper: {
    display: "flex",
    position: "relative",
    justifyContent: "space-around",
    paddingLeft: theme.spacing(7),
    paddingRight: theme.spacing(7),
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      paddingLeft: 0,
      paddingTop: theme.spacing(1),
      paddingRight: 0,
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      paddingBottom: 0,
    },
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
    [theme.breakpoints.down("md")]: {
      width: "100%",
      maxWidth: 600,
      paddingBottom: theme.spacing(3),
    },
  },
  thisisWhy: {
    paddingTop: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    fontSize: 25,
    fontWeight: 600,
  },
  expandLessIconWrapper: {
    textAlign: "center",
  },
  marked: {
    color: "yellow",
    fontWeight: 600,
  },
}));

export default function Challenge({ headlineClass, showContent, className }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale, classes: classes });
  return (
    <Container className={`${classes.root} ${className}`}>
      <Typography color="primary" component="h1" className={headlineClass}>
        {texts.the_challenge}
      </Typography>
      <div>
        <div className={classes.imageContainer}>
          <img
            src="/images/wildfire.jpg"
            alt={texts.the_challenge_image_text}
            className={classes.img}
          />
        </div>
        <div className={classes.contentWrapper}>
          <Container>
            <div className={classes.subHeaderWrapper}>
              {!isNarrowScreen && (
                <Typography component="h1" className={classes.subHeader}>
                  {texts.we_can_only_solve_the_climate_crisis_through_worldwide_collaboration}
                </Typography>
              )}
              {!showContent && <ExpandMoreIcon className={classes.expandMoreIcon} />}
            </div>
            <Collapse in={showContent} timeout={1000}>
              <div className={classes.challengesWrapper}>
                <Typography className={classes.challenge}>
                  {texts.the_climate_crisis_is_the_biggest_challenge_text}
                </Typography>
                <Typography className={classes.challenge}>
                  {texts.spread_effective_solutions_globally_text}
                </Typography>
                <Typography className={classes.challenge}>
                  {
                    texts.ngos_companies_governments_institutions_citizens_need_to_work_together_text
                  }
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
            {texts.this_is_why_we_created_climate_connect}
          </Typography>
        </Container>
      </div>
    </Container>
  );
}
