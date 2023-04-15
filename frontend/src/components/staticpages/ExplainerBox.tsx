import { Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import ExplainerElement from "./ExplainerElement";
import SmallCloud from "./SmallCloud";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  explainerWrapper: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 1000,
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      height: 580,
    },
  },
  cloud1: {
    position: "absolute",
    left: 50,
    top: -75,
    width: 150,
    height: 60,
  },
  cloud2: {
    position: "absolute",
    top: 20,
    left: 150,
  },
  cloud3: {
    position: "absolute",
    top: -50,
    left: "30%",
    width: 100,
  },
  cloud4: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 150,
    height: 100,
  },
  mobileCloud1: {
    position: "absolute",
    left: -100,
    top: -30,
    width: 135,
    height: 70,
    [theme.breakpoints.down("sm")]: {
      width: 100,
      height: 50,
      left: -50,
    },
  },
  mobileCloud2: {
    position: "absolute",
    right: -50,
  },
  mobileCloud3: {
    position: "absolute",
    right: -130,
    top: -70,
    width: 135,
  },
  mobileCloud4: {
    position: "absolute",
    bottom: -40,
    left: -90,
  },
  mobileCloud5: {
    position: "absolute",
    left: -50,
    top: 20,
    height: 70,
    width: 120,
  },
}));
export default function ExplainerBox({ h1ClassName, className, hideHeadline }: any) {
  const classes = useStyles();
  const isMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });

  return (
    <Container className={`${classes.root} ${className}`}>
      {!isMediumScreen && (
        <>
          <SmallCloud type={1} className={classes.cloud1} />
          <SmallCloud type={2} className={classes.cloud2} />
          <SmallCloud type={2} className={classes.cloud3} reverse />
          <SmallCloud type={1} className={classes.cloud4} />
        </>
      )}
      {!hideHeadline && (
        <Typography color="primary" component="h1" className={h1ClassName}>
          {texts.this_is_climate_connect}
        </Typography>
      )}
      <div className={classes.explainerWrapper}>
        <ExplainerElement
          text={
            <>
              {texts.a_free_nonprofit_climate_action_network}
              <br />
              {texts.hundred_percent_independent}.
            </>
          }
          icon="/icons/floating_sign_heart.svg"
          alt={texts.heart_icon}
        >
          {isMediumScreen && <SmallCloud type={1} className={classes.mobileCloud1} />}
        </ExplainerElement>
        <ExplainerElement
          text={<>{texts.for_everyone_who_contributes_or_wants_to_contribute}</>}
          icon="/icons/floating_sign_group.svg"
          alt={texts.group_of_people_icon}
        >
          {isMediumScreen && <SmallCloud type={2} className={classes.mobileCloud2} />}
          {isMediumScreen && <SmallCloud type={2} className={classes.mobileCloud3} reverse />}
          {isMediumScreen && <SmallCloud type={2} className={classes.mobileCloud4} reverse />}
        </ExplainerElement>
        <ExplainerElement
          text={<>{texts.enabling_global_and_locale_collaboration_and_knowledge_sharing}</>}
          icon="/icons/floating_sign_lightbulb.svg"
          alt={texts.idea_lightbulb_icon}
        >
          {isMediumScreen && <SmallCloud type={2} className={classes.mobileCloud5} />}
        </ExplainerElement>
      </div>
    </Container>
  );
}
