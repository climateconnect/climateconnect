import { Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import LightBigButton from "../staticpages/LightBigButton";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    marginTop: theme.spacing(10),
  },
  content: {
    width: 848,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      width: "auto",
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  heartIconContainer: {
    color: theme.palette.yellow.main,
    marginRight: theme.spacing(3),
  },
  headline: {
    color: "white",
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: 600,
    [theme.breakpoints.down("md")]: {
      fontSize: 16,
      fontWeight: 500,
      textAlign: "center",
    },
  },
  heartIcon: {
    width: 120,
    height: 120,
  },
  donateButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3),
  },
  yellow: {
    color: theme.palette.yellow.main,
  },
}));
export default function DonationsBanner({ h1ClassName }) {
  const classes = useStyles();
  const isMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "donate", locale: locale, classes: classes });
  return (
    <div className={classes.root}>
      <div className={classes.content}>
        {!isMediumScreen && (
          <div className={classes.heartIconContainer}>
            <FavoriteBorderIcon color="inherit" className={classes.heartIcon} />
          </div>
        )}
        <div>
          <Typography className={`${classes.headline} ${h1ClassName}`}>
            {texts.we_rely_on_your_donation_to_stay_independent}
          </Typography>
          <Typography className={classes.text}>
            {texts.we_are_non_profit_and_running_only_on_donations}
          </Typography>
        </div>
      </div>
      <div className={classes.donateButtonContainer}>
        <LightBigButton
          href={
            getLocalePrefix(locale) + "/donate"
          } /*TODO(undefined) className={classes.donateButton}*/
        >
          {texts.donate_now}
        </LightBigButton>
      </div>
    </div>
  );
}
