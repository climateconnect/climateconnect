import { Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import ExplainerElement from "../ExplainerElement";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(6),
  },
  wrapper: {
    display: "flex",
    marginTop: theme.spacing(3),
    position: "relative",
    [theme.breakpoints.down("md")]: {
      justifyContent: "center",
      height: 300,
    },
  },
  imageOuterWrapper: {
    width: "50%",
    paddingLeft: theme.spacing(15),
    paddingRight: theme.spacing(5),
    [theme.breakpoints.down("md")]: {
      position: "absolute",
      width: 325,
      height: 300,
      padding: 0,
      marginLeft: "auto",
      marginRight: "auto",
      background: "white",
    },
  },
  imageWrapper: {
    maxWidth: "100%",
    maxHeight: "100%",
    background: "url('/images/about-goal.svg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
  },
  image: {
    width: "100%",
    height: "100%",
    visibility: "hidden",
  },
  explainerElementsWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    paddingRight: theme.spacing(15),
    paddingLeft: theme.spacing(5),
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(2),
      justifyContent: "space-between",
      height: "100%",
      background: "rgba(255,255,255,0.9)",
      zIndex: 1,
    },
  },
}));

export default function Goals({ headlineClass }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });
  return (
    <Container className={classes.root}>
      <Typography color="primary" component="h1" className={headlineClass}>
        {texts.our_goals}
      </Typography>
      <div className={classes.wrapper}>
        <div className={classes.imageOuterWrapper}>
          <div className={classes.imageWrapper}>
            <img
              src="/images/about-goal.svg"
              className={classes.image}
              alt={texts.climate_actors_connecting_over_the_internet}
            />
          </div>
        </div>
        <div className={classes.explainerElementsWrapper}>
          <ExplainerElement
            text={
              <>
                <b>{texts.connect_everyone_working_on_climate_action}</b>
              </>
            }
            horizontal
            icon="/icons/floating_sign_group.svg"
            alt={texts.group_of_people_icon}
          />
          <ExplainerElement
            text={
              <>
                <b>{texts.accelerate_climate_action_worldwide}</b>
              </>
            }
            horizontal
            icon="/icons/floating_sign_group.svg"
            alt={texts.group_of_people_icon}
          />
          <ExplainerElement
            text={
              <>
                <b>{texts.one_platform_for_all_climate_actors}</b>
              </>
            }
            horizontal
            icon="/icons/floating_sign_group.svg"
            alt={texts.group_of_people_icon}
          />
        </div>
      </div>
    </Container>
  );
}
