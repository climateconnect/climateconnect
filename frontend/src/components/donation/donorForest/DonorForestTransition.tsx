import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import SmallCloud from "../../staticpages/SmallCloud";
import DonorForestExplainer from "./DonorForestExplainer";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    width: "100%",
  },
  transition: {
    height: 100,
    [theme.breakpoints.down("sm")]: {
      height: 40,
    },
  },
  mountainsContainer: {
    display: "flex",
    alignItems: "flex-end",
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  },
  mountains: {
    background: "url('/images/mountains.svg')",
    flexGrow: 1,
    height: 200,
    minWidth: 100,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "bottom",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  explainer: {
    marginBottom: theme.spacing(6),
  },
  smallCloud1: {
    position: "absolute",
    top: -30,
    left: 150,
    width: 45,
    height: 30,
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  smallCloud2: {
    position: "absolute",
    top: 0,
    left: 350,
    width: 39,
    height: 26,
    [theme.breakpoints.down("md")]: {
      left: 50,
      top: 50,
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  smallCloud3: {
    position: "absolute",
    top: 0,
    right: 350,
    width: 39,
    height: 26,
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  smallCloud4: {
    position: "absolute",
    top: 0,
    right: 150,
    width: 39,
    height: 26,
  },
  zepellin: {
    position: "absolute",
    right: 80,
    top: 50,
    width: 70,
  },
}));

export default function DonorForestTransition({ possibleBadges }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.transition} />
      <div className={classes.mountainsContainer}>
        <div className={classes.mountains} />
        <SmallCloud show type={1} className={classes.smallCloud1} white />
        <SmallCloud reverse show type={2} className={classes.smallCloud2} white />
        <DonorForestExplainer className={classes.explainer} possibleBadges={possibleBadges} />
        <SmallCloud show reverse type={1} className={classes.smallCloud3} white />
        <SmallCloud show type={2} className={classes.smallCloud4} white />
        <img src="/icons/zepellin.svg" className={classes.zepellin} />
        <div className={classes.mountains} />
      </div>
    </div>
  );
}
