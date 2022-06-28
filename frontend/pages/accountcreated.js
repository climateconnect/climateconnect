import { Link, Typography } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import Layout from "../src/components/layouts/layout";

const useStyles = makeStyles((theme) => ({
  headline: {
    fontStyle: "italic",
    marginBottom: theme.spacing(6),
  },
  box: {
    borderRadius: "60px",
    boxShadow: "2px 4px 10px 4px rgba(0,0,0,0.1)",
    maxWidth: 900,
    minWidth: 350,
    padding: theme.spacing(5),
  },
  image: {
    width: 300,
  },
  root: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  textbody: {
    marginTop: theme.spacing(4),
  },
}));

const verified = false;

export default function AccountCreated() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });

  if (verified)
    return (
      <Layout title={texts.account_created} hideHeadline>
        <div className={classes.root}>
          <img src="/images/signup-success.svg" className={classes.image} />
          <Card className={classes.box}>
            <Typography variant="h5" color="primary" className={classes.headline}>
              {texts.congratulations_you_have_created_your_account}
            </Typography>
            <Typography variant="h4" color="primary">
              <Link href={getLocalePrefix(locale) + "/signin"}>{texts.click_here_to_log_in}</Link>
            </Typography>
          </Card>
        </div>
      </Layout>
    );
  else
    return (
      <Layout title={texts.account_created} hideHeadline>
        <div className={classes.root}>
          <img src="/images/signup-success.svg" className={classes.image} />
          <Card className={classes.box}>
            <Typography variant="h6" color="primary" className={classes.headline}>
              {texts.congratulations_just_one_more_step_to_complete_your_signup}
            </Typography>
            <Typography variant="h4" color="primary">
              {texts.we_have_send_you_an_email_link}
            </Typography>
            <Typography variant="h4" color="primary">
              {texts.please_click_on_the_link_to_activate_your_account}
            </Typography>
            <Typography variant="h6" color="primary" className={classes.textbody}>
              {texts.make_sure_to_also_check_your_spam}
            </Typography>
          </Card>
        </div>
      </Layout>
    );
}
