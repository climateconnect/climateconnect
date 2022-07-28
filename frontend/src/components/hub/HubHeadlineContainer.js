import { makeStyles, Typography, Box } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import OpenClimateMatchButton from "../climateMatch/OpenClimateMatchButton";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    background: theme.palette.primary.main,
   
    maxWidth: 800,
    borderRadius: 5,
    border: theme.borders.thick,
    marginTop: props.isLocationHub ? theme.spacing(8) : theme.spacing(-11),
    [theme.breakpoints.down("sm")]: {
      marginTop: props.isLocationHub ? theme.spacing(8) : theme.spacing(-11),
    },
  

    ["@media(max-width:1260px)"]: {
      maxWidth: 550,
    },
  }),
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
      paddingBottom: theme.spacing(2),
    },
  },
 
  highlighted: {
    color: theme.palette.yellow.main,
  },
  climateMatchButtonContainer: {
    display: "flex",
    justifyContent: "right",
    height: 38,
    marginTop: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },

  subHeadLineText: {
    fontWeight:600
  },

  locationSubHeadlineTextContainer: {
    background: "white",
    borderRadius: "25px",
    color: theme.palette.secondary.main,
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(1.5),
  },


}));

export default function HubHeadlineContainer({
  subHeadline,
  headline,
  isLocationHub,
  hubUrl,
}) {
  const classes = useStyles({isLocationHub: isLocationHub});
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });

  

  return (
    <div className={classes.root}>
      <div className={classes.headlineContainer}>
        <Typography component="h1" className={classes.headline}>
     {headline}
                  </Typography>
      </div>
      <div className={classes.subHeadlineContainer}>
        <div className={`${isLocationHub && classes.locationSubHeadlineTextContainer}`}>
     
        <Typography className={classes.subHeadLineText}>
          {subHeadline}
        </Typography>
        
        
          
          </div>
        
          {isLocationHub && (
            <>
          <hr />
          <div className={classes.climateMatchButtonContainer}>
            <OpenClimateMatchButton hubUrl={hubUrl} text={texts.get_active_now_with_climatematch} />
          </div>
          </>
        )}
      </div>
    </div>
  );
}
