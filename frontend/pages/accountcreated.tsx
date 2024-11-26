import { Paper, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import Layout from "../src/components/layouts/layout";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    padding: theme.spacing(5),
  },
  headline: {
    marginBottom: theme.spacing(3),
  },
}));

const verified = false;

// TODO: update styles (refresh page style)
export default function AccountCreated() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });

  if (verified)
    return (
      <Layout title={texts.account_created} hideHeadline>
        <Paper className={classes.root}>
          <Typography variant="h5" className={classes.headline}>
            {texts.congratulations_you_have_created_your_account}
          </Typography>
          <Typography variant="h4">
            <a href={getLocalePrefix(locale) + "/signin"}>{texts.click_here_to_log_in}</a>
          </Typography>
        </Paper>
      </Layout>
    );
  else
    return (
      <Layout title={texts.account_created} hideHeadline>
        <Paper className={classes.root}>
          <Typography variant="h4" className={classes.headline}>
            {texts.just_one_more_step_to_complete_your_signup}
          </Typography>
          <Typography variant="h5">
            <div />
            <div>{texts.please_click_on_the_link_we_emailed_you_to_activate_your_account}</div>
            <br />
            <Typography component="p" variant="h6">
              {texts.if_the_email_does_not_arrive_after_5_minutes}
            </Typography>
            <br />
            <Typography component="p" variant="h6">
              {texts.make_sure_to_also_check_your_spam}
            </Typography>
            <Typography component="p" variant="h6">
              {texts.if_you_are_experiencing_any_problems_contact_us}.
            </Typography>
          </Typography>
        </Paper>
      </Layout>
    );
}
