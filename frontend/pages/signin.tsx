import React, { useContext, useEffect } from "react";
import { apiRequest, getLocalePrefix } from "../public/lib/apiOperations";
import { getParams } from "../public/lib/generalOperations";
import { redirectOnLogin } from "../public/lib/profileOperations";
import getTexts from "../public/texts/texts";
import WideLayout from "../src/components/layouts/WideLayout";
import UserContext from "./../src/components/context/UserContext";
import Form from "./../src/components/general/Form";
import Image from "next/image";
import { ThemeProvider } from "@emotion/react";
import { themeSignUp } from "../src/themes/signupTheme";
import { Card, CardContent, Typography, Container, Theme, useMediaQuery } from "@mui/material";
import ContentImageSplitView from "../src/components/layouts/ContentImageSplitLayout";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  title: {
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(4),
      paddingBottom: theme.spacing(2),
      textAlign: "center",
      fontSize: 35,
      fontWeight: "bold",
    },
  },
}));

export default function Signin() {
  const classes = useStyles();
  const { user, signIn, locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });
  const hugeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const fields = [
    {
      required: true,
      label: texts.email,
      key: "username",
      type: "email",
    },
    {
      required: true,
      label: texts.password,
      key: "password",
      type: "password",
    },
  ];

  const messages = {
    submitMessage: texts.log_in,
    bottomMessage: (
      <span>
        {texts.new_to_climate_connect}{" "}
        <a href={getLocalePrefix(locale) + "/signup"}>{texts.click_here_to_create_an_account}</a>
      </span>
    ),
  };

  const bottomLink = {
    text: texts.forgot_your_password,
    href: getLocalePrefix(locale) + "/resetpassword",
  };

  const [errorMessage, setErrorMessage] = React.useState<JSX.Element | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const [initialized, setInitialized] = React.useState(false);
  const [redirectUrl, setRedirectUrl] = React.useState<string | undefined>();
  useEffect(function () {
    if (!initialized) {
      const params = getParams(window.location.href);
      if (params.redirect) {
        let redirectUrl = getLocalePrefix(locale);
        const decodedRedirect = decodeURIComponent(params.redirect);

        if (!decodedRedirect.startsWith("/")) {
          redirectUrl += "/";
        }

        redirectUrl += decodedRedirect;
        setRedirectUrl(redirectUrl);
      }
      setInitialized(true);
      //TODO: remove router
    }
    if (user) {
      redirectOnLogin(user, redirectUrl, locale);
    }
  });

  const handleSubmit = async (event, values) => {
    //don't redirect to the post url
    event.preventDefault();
    setIsLoading(true);
    apiRequest({
      method: "post",
      url: "/login/",
      payload: {
        username: values.username.toLowerCase(),
        password: values.password,
      },
      locale: locale,
    })
      .then(async function (response) {
        await signIn(response.data.token, response.data.expiry, redirectUrl);
      })
      .catch(function (error) {
        console.log(error);
        if (error.response && error.response.data) {
          if (error.response.data.type === "not_verified")
            setErrorMessage(<span>{texts.not_verified_error_message}</span>);
          else setErrorMessage(error.response.data.message);
          setIsLoading(false);
        }
      });
  };

  const LoginContent = () => {
    return (
      <>
        <Typography color="primary" variant="h1" className={classes.title}>
          {texts.log_in}
        </Typography>
        <Typography color="primary" variant="h3"></Typography>

        <Form
          fields={fields}
          messages={messages}
          bottomLink={bottomLink}
          usePercentage={false}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
        />
      </>
    );
  };

  return (
    <WideLayout
      title={texts.log_in}
      // message={errorMessage}
      // messageType={errorMessage && "error"}
      messageType="error"
      isLoading={isLoading}
    >
      <Container maxWidth={hugeScreen ? "xl" : "lg"}>
        {isSmallScreen ? (
          <LoginContent />
        ) : (
          <ThemeProvider theme={themeSignUp}>
            <ContentImageSplitView
              minHeight="75vh"
              content={
                <Card variant="outlined">
                  <CardContent>
                    <LoginContent />
                  </CardContent>
                </Card>
              }
              leftGridSizes={{ md: 7 }}
              rightGridSizes={{ md: 5 }}
              image={
                <Image
                  src="/images/sign_up/mobile-login-pana.svg"
                  alt="Sign Up"
                  layout="fill" // Image will cover the container
                  objectFit="contain" // Ensures it fills without stretching
                />
              }
            ></ContentImageSplitView>
          </ThemeProvider>
        )}
      </Container>
    </WideLayout>
  );
}
