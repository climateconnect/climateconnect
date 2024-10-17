import React, { useContext, useEffect } from "react";
import { apiRequest, getLocalePrefix } from "../public/lib/apiOperations";
import { getParams } from "../public/lib/generalOperations";
import { redirectOnLogin } from "../public/lib/profileOperations";
import getTexts from "../public/texts/texts";
import Layout from "../src/components/layouts/layout";
import UserContext from "./../src/components/context/UserContext";
import Form from "./../src/components/general/Form";

export default function Signin() {
  const { user, signIn, locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });

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

  return (
    <Layout
      title={texts.log_in}
      isLoading={isLoading}
      messageType="error"
      canonicalUrl={`${process.env.BASE_URL + getLocalePrefix(locale) + "/signin"}`}
    >
      <Form
        fields={fields}
        messages={messages}
        bottomLink={bottomLink}
        usePercentage={false}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />
    </Layout>
  );
}
