import React from "react";
import { Typography, makeStyles, Container, useMediaQuery } from "@material-ui/core";
import SmallCloud from "./SmallCloud";
import theme from "../../themes/theme";
import ExplainerElement from "./ExplainerElement";

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
    [theme.breakpoints.down("sm")]: {
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
    [theme.breakpoints.down("xs")]: {
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
export default function ExplainerBox({ h1ClassName, className, hideHeadline }) {
  const classes = useStyles();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
          This is Climate Connect
        </Typography>
      )}
      <div className={classes.explainerWrapper}>
        <ExplainerElement
          text={
            <>
              A <b>free, non-profit</b> climate action network.
              <br />
              100% Independent.
            </>
          }
          icon="/icons/floating_sign_heart.svg"
          alt="Heart Icon"
        >
          {isMediumScreen && <SmallCloud type={1} className={classes.mobileCloud1} />}
        </ExplainerElement>
        <ExplainerElement
          text={
            <>
              For <b>everyone</b> who contributes or
              <br />
              wants to contribute to solving the
              <br />
              climate crisis.
            </>
          }
          icon="/icons/floating_sign_group.svg"
          alt="Group of People icon"
        >
          {isMediumScreen && <SmallCloud type={2} className={classes.mobileCloud2} />}
          {isMediumScreen && <SmallCloud type={2} className={classes.mobileCloud3} reverse />}
          {isMediumScreen && <SmallCloud type={2} className={classes.mobileCloud4} reverse />}
        </ExplainerElement>
        <ExplainerElement
          text={
            <>
              Enabling global and local
              <br />
              <b>{"collaboration and knowledge sharing"}</b>
              <br />
              in climate action.
            </>
          }
          icon="/icons/floating_sign_lightbulb.svg"
          alt="Idea lightbulb"
        >
          {isMediumScreen && <SmallCloud type={2} className={classes.mobileCloud5} />}
        </ExplainerElement>
      </div>
    </Container>
  );
}
