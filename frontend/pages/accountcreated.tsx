import {
  Card,
  CardContent,
  Container,
  Paper,
  Theme,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../public/lib/apiOperations";
import Image from "next/image";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import { themeSignUp } from "../src/themes/theme";
import ContentImageSplitView from "../src/components/layouts/ContentImageSplitLayout";
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
}));

const verified = false;

export default function AccountCreated() {
  const classes = useStyles();
  const hugeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));

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
      <Typography color="primary" component="p" variant="h3">
        {texts.make_sure_to_also_check_your_spam}
        <br />
        {texts.if_the_email_does_not_arrive_after_5_minutes}
      </Typography>
    </div>
  );

  return (
    <WideLayout title={texts.account_created}>
      <Container maxWidth={hugeScreen ? "xl" : "lg"}>
        <ThemeProvider theme={themeSignUp}>
          <ContentImageSplitView
            minHeight="75vh"
            reversed={true}
            content={
              <Card>
                <CardContent>{cardContent}</CardContent>
              </Card>
            }
            image={
              <Image
                src="/images/sign_up/success-factors-pana.svg"
                alt="Sign Up"
                layout="fill" // Image will cover the container
                objectFit="contain" // Ensures it fills without stretching
              />
            }
          ></ContentImageSplitView>
        </ThemeProvider>
      </Container>
    </WideLayout>
  );
}
