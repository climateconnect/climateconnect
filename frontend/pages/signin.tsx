import React, { useContext, useEffect } from "react";
import { apiRequest, getLocalePrefix } from "../public/lib/apiOperations";
import { getParams } from "../public/lib/generalOperations";
import { redirectOnLogin } from "../public/lib/profileOperations";
import getTexts from "../public/texts/texts";
import WideLayout from "../src/components/layouts/WideLayout";
import UserContext from "./../src/components/context/UserContext";
import { ThemeProvider } from "@emotion/react";
import { themeSignUp } from "../src/themes/signupTheme";
import { Container, Link, Theme, useMediaQuery } from "@mui/material";
import getHubTheme from "../src/themes/fetchHubTheme";
import { transformThemeData } from "../src/themes/transformThemeData";
import Login from "../src/components/signup/Login";

export async function getServerSideProps(ctx) {
  const hubSlug = ctx.query.hub;
  const message = ctx.query.message;
  const message_type = ctx.query.message_type;

  // early return to avoid fetching /undefined/theme
  if (!hubSlug) {
    return {
      props: {
        message: message || null,
        message_type: message_type || null,
      },
    };
  }
  const hubThemeData = await getHubTheme(hubSlug);

  // early return to avoid a hubSlug, that is not supported within the backend
  if (!hubThemeData) {
    return {
      props: {
        message: message || null,
        message_type: message_type || null,
        hubSlug: hubSlug || null,
      },
    };
  }

  return {
    props: {
      hubSlug: hubSlug || null, // undefined is not allowed in JSON, so we use null
      hubThemeData: hubThemeData || null, // undefined is not allowed in JSON, so we use null
      message: message || null,
      message_type: message_type || null,
    },
  };
}

export default function Signin({ hubSlug, hubThemeData, message, message_type }) {
  const { user, signIn, locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubSlug });
  const hugeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));
  const mobileScreenSize = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

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
        <Link
          style={{ textDecoration: "underline" }}
          href={`${getLocalePrefix(locale)}/signup${hubSlug ? `?hub=${hubSlug}` : ""}`}
        >
          {texts.click_here_to_create_an_account}
        </Link>
      </span>
    ),
  };

  const bottomLink = {
    text: texts.forgot_your_password,
    href: `${getLocalePrefix(locale)}/resetpassword${hubSlug ? `?hub=${hubSlug}` : ""}`,
  };

  const [errorMessage, setErrorMessage] = React.useState<JSX.Element | null>(
    message_type !== "success" && message
  );
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
      } else if (params.hub) {
        setRedirectUrl(getLocalePrefix(locale) + "/hubs/" + params.hub + "/browse");
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

  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;
  const customThemeSignIn = hubThemeData
    ? transformThemeData(hubThemeData, themeSignUp)
    : themeSignUp;
  return (
    <WideLayout
      title={texts.log_in}
      //message={errorMessage}z
      //messageType={errorMessage && "error"}
      messageType={message_type ? message_type : "error"}
      isLoading={isLoading}
      customTheme={customTheme}
      isHubPage={hubSlug !== ""}
      hubUrl={hubSlug}
      headerBackground={hubSlug === "prio1" && mobileScreenSize ? "#7883ff" : "transparent"}
      footerTextColor={hubSlug && !mobileScreenSize && "white"}
    >
      <Container maxWidth={hugeScreen ? "xl" : "lg"}>
        <ThemeProvider theme={customThemeSignIn}>
          <Login
            texts={texts}
            fields={fields}
            messages={messages}
            bottomLink={bottomLink}
            handleSubmit={handleSubmit}
            errorMessage={errorMessage}
            hubUrl={hubSlug}
          />
        </ThemeProvider>
      </Container>
    </WideLayout>
  );
}
