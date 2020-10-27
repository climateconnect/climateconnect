import React from "react";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import { Typography, makeStyles, useMediaQuery } from "@material-ui/core";
import LightBigButton from "./LightBigButton";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.primary.main,
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    marginTop: theme.spacing(10)
  },
  content: {
    width: 848,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  heartIconContainer: {
    color: theme.palette.yellow.main,
    marginRight: theme.spacing(3)
  },
  headline: {
    color: "white"
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: 600,
    [theme.breakpoints.down("sm")]: {
      fontSize: 16,
      fontWeight: 500,
      textAlign: "center"
    }
  },
  heartIcon: {
    width: 120,
    height: 120
  },
  donateButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3)
  },
  yellow: {
    color: theme.palette.yellow.main
  }
}));
export default function DonationsBanner({ h1ClassName }) {
  const classes = useStyles();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <div className={classes.root}>
      <div className={classes.content}>
        {!isMediumScreen &&
          <div className={classes.heartIconContainer}>
            <FavoriteBorderIcon color="inherit" className={classes.heartIcon} />
          </div>
        }
        <div>
          <Typography className={`${classes.headline} ${h1ClassName}`}>
            We rely on your donation to <span className={classes.yellow}>stay independent!</span>
          </Typography>
          <Typography className={classes.text}>
            We are non-profit and running only on donations. Only with your financial support we can
            connect climate actors worldwide sustainably in the long run.
          </Typography>
        </div>
      </div>
      <div className={classes.donateButtonContainer}>
        <LightBigButton href="/donate" className={classes.donateButton}>
          Donate now
        </LightBigButton>
      </div>
    </div>
  );
}
