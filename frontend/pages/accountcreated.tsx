import { Card, CardContent, Container, Paper, ThemeProvider, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../public/lib/apiOperations";
import Image from "next/image";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import Layout from "../src/components/layouts/layout";
import { themeSignUp } from "../src/themes/theme";
import HorizontalSplitLayout from "../src/components/layouts/HorizontalSplitLayout";
import WideLayout from "../src/components/layouts/WideLayout";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    padding: theme.spacing(5),
  },
  italic: {
    fontStyle: "italic",
  },
  centerText: {
    textAlign: "center",
  },
  signUpLayoutWrapper: {
    minHeight: "80vh",
    allignItems: "stretch",
  },
}));

const verified = false;

export default function AccountCreated() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });

  const cardContent = verified ? (
    <>
      <Typography variant="h5">{texts.congratulations_you_have_created_your_account}</Typography>
      <Typography variant="h4">
        <a href={getLocalePrefix(locale) + "/signin"}>{texts.click_here_to_log_in}</a>
      </Typography>
    </>
  ) : (
    <div>
      <Typography
        color="primary"
        variant="h3"
        className={`${classes.italic} ${classes.centerText}`}
      >
        {texts.just_one_more_step_to_complete_your_signup}
      </Typography>
      <br />
      <Typography color="primary" variant="h2">
        {texts.please_click_on_the_link_we_emailed_you_to_activate_your_account}
      </Typography>
      <br />
      <Typography component="p" variant="h3">
        {texts.make_sure_to_also_check_your_spam}
        <br />
        {texts.if_the_email_does_not_arrive_after_5_minutes}
      </Typography>
    </div>
  );

  return (
    <WideLayout title={texts.account_created}>
      <Container maxWidth="xl">
        <ThemeProvider theme={themeSignUp}>
          <HorizontalSplitLayout
            wrapperProps={{ className: classes.signUpLayoutWrapper, direction: "row-reverse" }}
            left={
              <Card>
                <CardContent>{cardContent}</CardContent>
              </Card>
            }
            right={
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Image
                  src="/images/sign_up/success-factors-pana.svg"
                  alt="Sign Up"
                  layout="fill" // Image will cover the container
                  objectFit="contain" // Ensures it fills without stretching
                />
              </div>
            }
          ></HorizontalSplitLayout>
        </ThemeProvider>
      </Container>
    </WideLayout>
  );
}
