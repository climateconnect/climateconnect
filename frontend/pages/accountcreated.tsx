import {
  Button,
  Card,
  CardContent,
  Container,
  Link,
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
import { themeSignUp } from "../src/themes/signupTheme";
import ContentImageSplitView from "../src/components/layouts/ContentImageSplitLayout";
import WideLayout from "../src/components/layouts/WideLayout";

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("sm")]: {
      padding: 0,
      boxShadow: "none",
      borderRadius: 0,
      textAlign: "center",
    }
  },
  italic: {
    fontStyle: "italic",
  },
  centerText: {
    textAlign: "center",
  },
  sentEmailText: {
    fontWeight: "bold",
    marginBottom: theme.spacing(4)
  },
  centerContent: {
    display: "flex",
    justifyContent: "center",
  },
  marginBottom: {
    marginBottom: theme.spacing(5),
  },
  smallScreenHeadline: {
    fontSize: 35,
    textAlign: "center",
    fontWeight: "bold",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2)
  },
}));

export default function AccountCreated() {
  const classes = useStyles();
  const hugeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });

  const cardContent = (
    <div >
      {isSmallScreen ? (
        <Typography
          color="secondary"
          variant="h1"
          className={classes.smallScreenHeadline}
        >
          {texts.almost_done}
        </Typography>
        ) : (
          <Typography
            variant="h3"
            color="secondary"
            className={`${classes.italic}`}
          >
            {texts.just_one_more_step_to_complete_your_signup}
          </Typography>
        )
      }      
      <br />
      <Typography color="primary" variant={isSmallScreen ? "h5" : "h2"} className={isSmallScreen ? classes.sentEmailText : ""}>
        {texts.we_sent_you_an_email_with_a_link}<br />
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

  return (
    <WideLayout title={texts.account_created}>
      <Container maxWidth={hugeScreen ? "xl" : "lg"}>
        <ThemeProvider theme={themeSignUp}>
          <ContentImageSplitView
            minHeight="75vh"
            direction="row-reverse"
            content={
              <Card className={classes.root}>
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
