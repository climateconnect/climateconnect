import React, { useContext } from "react";
import { makeStyles, Typography, IconButton, useMediaQuery, Button } from "@material-ui/core";
import about_page_info from "../../../public/data/about_page_info";
import InfoBubble from "../../../src/components/about/InfoBubble";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import Cookies from "universal-cookie";
import HeadingText from "./HeadingText";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

const useStyles = makeStyles(theme => {
  return {
    mainHeadingOuterContainer: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6)
    },
    mainHeadingContainer: {
      margin: `0 auto`,
      marginBottom: theme.spacing(3)
    },
    infoTextContainer: {
      maxWidth: 1260,
      margin: "0 auto",
      textAlign: "center",
      marginTop: theme.spacing(2),
      border: `5px solid #707070`,
      borderRadius: 30,
      padding: theme.spacing(3),
      paddingTop: theme.spacing(5),
      [theme.breakpoints.down("md")]: {
        flex: "0 0 725px"
      },
      [theme.breakpoints.up("lg")]: {
        flex: "0 0 960px"
      }
    },
    textAboveButton: {
      marginBottom: theme.spacing(3)
    },
    bubbleGrid: {
      padding: 0,
      width: "100%",
      margin: "0 auto",
      display: "flex",
      justifyContent: "center",
      flexFlow: "wrap",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1)
    },
    shareLink: {
      textDecoration: "inherit"
    },
    links: {
      display: "flex",
      justifyContent: "space-between",
      width: 640,
      margin: "0 auto",
      textDecoration: "underline"
    },
    linksContainer: {
      marginBottom: theme.spacing(2)
    },
    outerContainer: {
      display: "flex",
      maxWidth: 1400,
      margin: "0 auto"
    },
    storyIconLeft: {
      width: 370,
      [theme.breakpoints.down("md")]: {
        width: 340
      },
      userDrag: "none"
    },
    storyIconRight: {
      width: 370,
      direction: "rtl",
      float: "right",
      userDrag: "none",
      [theme.breakpoints.down("md")]: {
        width: 340
      }
    },
    storyIconContainer: {
      overflow: "hidden"
    },
    boxText: {
      fontSize: 22,
      [theme.breakpoints.down("md")]: {
        fontSize: 20
      }
    },
    buttonsDiv: {
      position: "relative"
    },
    toggleButton: {
      position: "absolute",
      right: 0
    }
  };
});

export default function MainHeadingContainer({ hideInfo }) {
  const [showInfoText, setShowInfoText] = React.useState(!hideInfo);
  const classes = useStyles();
  const { user } = useContext(UserContext);
  const cookies = new Cookies();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const toggleShowInfoText = () => {
    const now = new Date();
    const oneYearFromNow = new Date(now.setFullYear(now.getFullYear() + 1));
    if (showInfoText) {
      cookies.set("hideInfo", true, { path: "/", expires: oneYearFromNow, sameSite: true });
      setShowInfoText(false);
    } else {
      cookies.set("hideInfo", false, { path: "/", expires: oneYearFromNow, sameSite: true });
      setShowInfoText(true);
    }
  };

  return (
    <div className={classes.mainHeadingOuterContainer}>
      <div className={classes.mainHeadingContainer}>
        <HeadingText showInfoText={showInfoText} toggleShowInfoText={toggleShowInfoText} />
        {showInfoText && (
          <div className={classes.outerContainer}>
            <div className={classes.storyIconContainer}>
              <img src="/icons/mainpage-left.svg" className={classes.storyIconLeft} />
            </div>
            <div className={classes.infoTextContainer}>
              <Typography component="div">
                <Typography className={classes.boxText}>
                  Climate Connect is a free, non-profit climate action platform -{" "}
                </Typography>
                <Typography className={classes.boxText}>
                  Bringing everyone involved in climate action together.
                </Typography>
                <div className={classes.bubbleGrid}>
                  {about_page_info.map((info, index) => (
                    <InfoBubble
                      data={info}
                      key={index}
                      size={isMediumScreen ? "small" : "medium"}
                      color="primary"
                    />
                  ))}
                </div>
                <Typography className={`${classes.textAboveButton} ${classes.boxText}`}>
                  We need global collaboration to effectively fight climate change.
                </Typography>
                <div className={classes.buttonsDiv}>
                  {!user && (
                    <Button href="signup" variant="contained" color="primary">
                      <a className={classes.shareLink}>
                        <b>Join Climate Connect Now</b>
                      </a>
                    </Button>
                  )}
                  <IconButton onClick={toggleShowInfoText} className={classes.toggleButton}>
                    <KeyboardArrowUpIcon />
                  </IconButton>
                </div>
              </Typography>
            </div>
            <div className={classes.storyIconContainer}>
              <img src="/icons/mainpage-right.svg" className={classes.storyIconRight} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
