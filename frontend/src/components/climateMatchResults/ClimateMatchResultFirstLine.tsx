import { Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ClimateMatchResultImage from "./ClimateMatchResultImage";

const useStyles = makeStyles((theme) => ({
  rankAndTypeContainer: {
    display: "flex",
    alignItems: "center",
  },
  rankNumber: {
    color: theme.palette.primary.main,
    fontFamily: "flood-std, sans-serif",
    fontSize: 30,
    border: `3px solid ${theme.palette.yellow.main}`,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "100%",
    [theme.breakpoints.down("sm")]: {
      width: 60,
      height: 60,
      fontSize: 45,
      border: `5px solid ${theme.palette.yellow.main}`,
      marginRight: theme.spacing(3),
    },
    ["@media(max-width: 550px)"]: {
      width: 50,
      height: 50,
      fontSize: 40,
    },
    ["@media(max-width: 400px)"]: {
      marginRight: theme.spacing(1),
    },
  },
  ressourceType: {
    marginLeft: theme.spacing(1),
    fontWeight: 600,
  },
  divider: {
    height: 60,
    width: 1,
    background: "black",
  },
  resultImageMobile: {
    paddingLeft: theme.spacing(3),
    ["@media(max-width: 400px)"]: {
      paddingLeft: theme.spacing(1),
    },
  },
}));

export default function ClimateMatchResultFirstLine({ pos, suggestion }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  return (
    <div className={classes.rankAndTypeContainer}>
      <div className={classes.rankNumber}>{pos + 1}</div>
      {isNarrowScreen && suggestion.ressource_type === "organization" ? (
        <>
          <div className={classes.divider} />
          <ClimateMatchResultImage suggestion={suggestion} className={classes.resultImageMobile} />
        </>
      ) : (
        <Typography className={classes.ressourceType}>
          {texts[suggestion.ressource_type]}: {isNarrowScreen && suggestion.name}
        </Typography>
      )}
    </div>
  );
}
