import React, { useContext } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, Card } from "@mui/material";
import ContentImageSplitView from "../layouts/ContentImageSplitLayout";
import AccountCreatedIcon from "../../../public/images/sign_up/success-factors-pana.svg";
import UserContext from "../context/UserContext";
import getTexts from "../../../public/texts/texts";

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("sm")]: {
      padding: 0,
      boxShadow: "none",
      borderRadius: 0,
      textAlign: "center",
    },
  },
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
  icon: {
    color: theme.palette.background.default_contrastText,
  },
}));

export default function AccountCreatedContent({ isSmallScreen, hubUrl }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });
  return (
    <ContentImageSplitView
      minHeight="75vh"
      direction="row-reverse"
      content={
        <Card className={classes.root}>
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
        </Card>
      }
      image={<AccountCreatedIcon className={classes.icon} />}
    />
  );
}
