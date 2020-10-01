import React from "react";
import { Typography, makeStyles, IconButton } from "@material-ui/core";
import TextLoop from "react-text-loop";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";

const useStyles = makeStyles(theme => {
  return {
    mainHeading: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      marginBottom: -37,
      position: "absolute",
      width: "100%"
    },
    mainHeadingInfoTextHidde: {
      position: "relative",
      marginBottom: 0
    },
    titleText: {
      display: "inline-block",
      fontWeight: "bold",
      fontSize: 30,
      [theme.breakpoints.down("md")]: {
        fontSize: 21
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: 12.5
      }
    },
    titleTextRight: {
      display: "inline-block",
      marginLeft: theme.spacing(0.75),
      fontWeight: "bold",
      fontSize: 30,
      [theme.breakpoints.down("md")]: {
        fontSize: 21
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: 12.5
      }
    },
    mainHeadingText: props => ({
      background: props.mobile ? "none" : "white",
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }),
    mainHeadingTextInfoHidden: {
      paddingLeft: 0,
      paddingRight: theme.spacing(1)
    }
  };
});

export default function HeadingText({ mobile, showInfoText, toggleShowInfoText }) {
  const classes = useStyles({ mobile: mobile });
  return (
    <div
      component="h1"
      variant="h5"
      className={`${classes.mainHeading} ${!showInfoText && classes.mainHeadingInfoTextHidde}`}
    >
      <div
        className={`${classes.mainHeadingText} ${!showInfoText &&
          classes.mainHeadingTextInfoHidden}`}
      >
        <TextLoop mask={true} interval={5000}>
          <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
            Share
          </Typography>
          <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
            Find
          </Typography>
          <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
            Work on
          </Typography>
          <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
            Get inspired by
          </Typography>
          <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
            Replicate
          </Typography>
          <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
            {mobile ? "Join" : "Collaborate with"}
          </Typography>
        </TextLoop>
        <Typography
          component="h1"
          variant="h5"
          className={classes.titleTextRight}
          color="secondary"
        >
          the most effective climate projects
        </Typography>
      </div>
      {toggleShowInfoText && !showInfoText && (
        <IconButton onClick={toggleShowInfoText} className={classes.toggleButton}>
          <KeyboardArrowDownIcon />
        </IconButton>
      )}
    </div>
  );
}
