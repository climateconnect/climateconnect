import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Checkbox, Container, Button, useMediaQuery } from "@material-ui/core";
import Cookies from "universal-cookie";

const useStyles = makeStyles(theme => {
  return {
    root: {
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      height: 150,
      background: "white",
      borderTop: `1px solid ${theme.palette.secondary.main}`,
      paddingTop: theme.spacing(1),
      [theme.breakpoints.down("md")]: {
        height: 200
      }
    },
    headline: {
      fontWeight: "bold",
      marginBottom: theme.spacing(1),
      [theme.breakpoints.down("md")]: {
        fontSize: 15
      }
    },
    buttons: {
      float: "right",
      [theme.breakpoints.down("md")]: {
        float: "none",
        display: "block"
      }
    },
    leftButton: {
      [theme.breakpoints.up("md")]: {
        marginRight: theme.spacing(1)
      },
      [theme.breakpoints.down("md")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
      }
    },
    rightButton: {
      [theme.breakpoints.down("md")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
      }
    },
    leftButtonContainer: {
      display: "inline-block",
      [theme.breakpoints.down("md")]: {
        width: "50%",
        padding: theme.spacing(0.5)
      }
    },
    rightButtonContainer: {
      display: "inline-block",
      [theme.breakpoints.down("md")]: {
        width: "50%",
        padding: theme.spacing(0.5)
      }
    }
  };
});

export default function CookieBanner({ closeBanner }) {
  const classes = useStyles();
  const [checked, setChecked] = React.useState({ necessary: true, statistics: false });
  const cookies = new Cookies();
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));

  const onStatisticsChange = () => {
    setChecked({ ...checked, statistics: !checked.statistics });
  };

  const now = new Date();
  const oneYearFromNow = new Date(now.setFullYear(now.getFullYear() + 1));

  const confirmSelection = () => {
    cookies.set("acceptedNecessary", true, { path: "/", sameSite: true, expires: oneYearFromNow });
    cookies.set("acceptedStatistics", checked.statistics, {
      path: "/",
      sameSite: true,
      expires: oneYearFromNow
    });
    closeBanner();
  };

  const enableAll = () => {
    cookies.set("acceptedNecessary", true, { path: "/", sameSite: true, expires: oneYearFromNow });
    cookies.set("acceptedStatistics", true, { path: "/", sameSite: true, expires: oneYearFromNow });
    closeBanner();
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        <Typography variant="h6" color="secondary" className={classes.headline}>
          Cookie information and settings
        </Typography>
        {!isNarrowScreen && (
          <Typography variant="body2">
            We use cookies in order to offer you an optimal service and to further improve our
            websites on the basis of statistics.
          </Typography>
        )}
        <Typography variant="body2">
          For more information check out our{" "}
          <a href="privacy" target="_blank">
            privacy policy
          </a>{" "}
          and{" "}
          <a href="terms" target="_blank">
            terms of use
          </a>
        </Typography>
        <Checkbox defaultChecked checked={checked.necessary} disabled color="primary" />
        Necessary
        <Checkbox color="primary" checked={checked.statistics} onChange={onStatisticsChange} />
        Statistics
        <span className={classes.buttons}>
          <div className={classes.leftButtonContainer}>
            <Button variant="contained" className={classes.leftButton} onClick={confirmSelection}>
              Confirm Selection
            </Button>
          </div>
          <div className={classes.rightButtonContainer}>
            <Button
              color="primary"
              className={classes.rightButton}
              variant="contained"
              onClick={enableAll}
            >
              Enable all cookies
            </Button>
          </div>
        </span>
      </Container>
    </div>
  );
}
