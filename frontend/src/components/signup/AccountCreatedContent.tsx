import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  sentEmailText: {
    color: theme.palette.background.default_contrastText,
    [theme.breakpoints.down("sm")]: {
      fontWeight: "bold",
      marginBottom: theme.spacing(4),
    },
  },
  smallScreenHeadline: {
    fontSize: 35,
    textAlign: "center",
    fontWeight: "bold",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  largeScreenHeadline: {
    fontStyle: "italic",
    color: "inherit",
  },
}));

export default function AccountCreatedContent({ isSmallScreen, texts }) {
  const classes = useStyles();
  return (
    <div>
      {isSmallScreen ? (
        <Typography className={classes.smallScreenHeadline}>{texts.almost_done}</Typography>
      ) : (
        <Typography variant="h3" className={`${classes.largeScreenHeadline}`}>
          {texts.just_one_more_step_to_complete_your_signup}
        </Typography>
      )}
      <br />
      <Typography variant={isSmallScreen ? "h5" : "h2"} className={classes.sentEmailText}>
        {texts.we_sent_you_an_email_with_a_link}
        <br />
        {texts.please_click_on_the_link_to_activate_your_account}
      </Typography>
      <br />
      <Typography component="p" variant="h6">
        {texts.make_sure_to_also_check_your_spam}
        <br />
        {texts.if_the_email_does_not_arrive_after_5_minutes}
      </Typography>
    </div>
  );
}
