import { IconButton, makeStyles, Typography } from "@material-ui/core";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import AlternatingText from "../general/AlternatingText";

const useStyles = makeStyles((theme) => {
  return {
    mainHeading: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      marginBottom: -37,
      position: "absolute",
      width: "100%",
    },
    mainHeadingInfoTextHidde: {
      position: "relative",
      marginBottom: 0,
    },
    titleText: {
      display: "inline-block",
      fontWeight: "bold",
      fontSize: 30,
      [theme.breakpoints.down("md")]: {
        fontSize: 21,
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: 12.5,
      },
    },
    titleTextRight: {
      display: "inline-block",
      marginLeft: theme.spacing(0.75),
      fontWeight: "bold",
      fontSize: 30,
      [theme.breakpoints.down("md")]: {
        fontSize: 21,
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: 12.5,
      },
    },
    mainHeadingText: (props) => ({
      background: props.mobile ? "none" : "white",
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    }),
    mainHeadingTextInfoHidden: {
      paddingLeft: 0,
      paddingRight: theme.spacing(1),
    },
  };
});

export default function HeadingText({ mobile, showInfoText, toggleShowInfoText }) {
  const classes = useStyles({ mobile: mobile });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <div
      component="h1"
      variant="h5"
      className={`${classes.mainHeading} ${!showInfoText && classes.mainHeadingInfoTextHidde}`}
    >
      <div
        className={`${classes.mainHeadingText} ${
          !showInfoText && classes.mainHeadingTextInfoHidden
        }`}
      >
        <AlternatingText mobile={mobile} classes={classes} />
        <Typography
          component="h1"
          variant="h5"
          className={classes.titleTextRight}
          color="secondary"
        >
          {texts.the_most_effective_climate_project}
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
