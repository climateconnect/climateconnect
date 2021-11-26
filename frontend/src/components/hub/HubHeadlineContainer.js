import { makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import OpenClimateMatchButton from "../climateMatch/OpenClimateMatchButton";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    padding: theme.spacing(0),
    marginTop: theme.spacing(-10),
    maxWidth: 675,
    borderRadius: 5,
    border: theme.borders.thick,
    [theme.breakpoints.up("lg")]: {
      marginTop: theme.spacing(-13),
    },
    ["@media(max-width:1100px)"]: {
      maxWidth: 550,
    },
  },
  headlineContainer: {
    display: "flex",
    alignItems: "center",
  },
  headline: {
    fontSize: 30,
    fontWeight: 700,
    [theme.breakpoints.down("sm")]: {
      fontSize: 25,
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: 25,
    },
    color: "white",
    padding: theme.spacing(1),
  },
  subHeadlineContainer: {
    background: "#f0f2f5",
    padding: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(2),
    },
  },
  subHeadline: {
    color: theme.palette.secondary.main,
    fontWeight: 600,
  },
  highlighted: {
    color: theme.palette.yellow.main,
  },
  climateMatchButtonContainer: {
    display: "flex",
    justifyContent: "right",
    marginTop: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

export default function HubHeadlineContainer({
  subHeadline,
  headline,
  hubName,
  isLocationHub,
  hubUrl,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });

  const getColoredHeadlineObject = () => {
    return headline.split(" ").reduce((arr, word, index) => {
      const newWordEntry = {
        //add a space if it's not the last word of the sentence
        text: index === headline.split(" ") - 1 ? word : `${word} `,
      };
      if (hubName.includes(word)) {
        newWordEntry.isHighlighted = true;
      }
      arr.push(newWordEntry);
      return arr;
      //add either <span className={classes.yellow}>{word}</span>
      //or simple <>{word}</> depending on whether the word is
      //present in the hub name.
      //if it's not the last word, add " "
    }, []);
  };

  return (
    <div className={classes.root}>
      <div className={classes.headlineContainer}>
        <Typography component="h1" className={classes.headline}>
          {getColoredHeadlineObject().map((word, index) => (
            <span key={index} className={word.isHighlighted && classes.highlighted}>
              {word.text}
            </span>
          ))}
        </Typography>
      </div>
      <div className={classes.subHeadlineContainer}>
        <Typography component="h2" className={classes.subHeadline}>
          {subHeadline}
        </Typography>
        {isLocationHub && (
          <div className={classes.climateMatchButtonContainer}>
            <OpenClimateMatchButton hubUrl={hubUrl} text={texts.get_active_now_with_climatematch} />
          </div>
        )}
      </div>
    </div>
  );
}
