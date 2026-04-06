import { Link, Typography } from "@mui/material";
import nextCookies from "next-cookies";
import React, { useContext, useEffect } from "react";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix, isSafeInternalRedirect, sendToLogin } from "../../public/lib/apiOperations";
import { redirectOnLogin } from "../../public/lib/profileOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import Layout from "../../src/components/layouts/layout";

export async function getServerSideProps(ctx) {
  const uuid = encodeURI(ctx.query.uuid);
  const messages = await profileVerification(uuid, ctx.locale);
  const texts = getTexts({ page: "settings", locale: ctx.locale });
  if (messages?.successMessage) {
    const messageOnRedirect = messages.successMessage + " " + texts.you_can_now_log_in;
    const { postSignupRedirect } = nextCookies(ctx);
    if (isSafeInternalRedirect(postSignupRedirect)) {
      // Clear the cookie and pass the original redirect URL into the signin URL
      ctx.res.setHeader(
        "Set-Cookie",
        "postSignupRedirect=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
      );
      const languagePrefix = ctx.locale === "en" ? "" : `/${ctx.locale}`;
      const destination =
        `${languagePrefix}/signin?redirect=${encodeURIComponent(postSignupRedirect)}` +
        `&message=${encodeURIComponent(messageOnRedirect)}&message_type=success`;
      return { redirect: { destination, permanent: false } };
    }
    return sendToLogin(ctx, messageOnRedirect, "success");
  }
  return {
    props: {
      successMessage: messages["successMessage"] ? messages["successMessage"] : null,
      errorMessage: messages["errorMessage"] ? messages["errorMessage"] : null,
    },
  };
}

async function profileVerification(uuid, locale) {
  const payload = {
    uuid: uuid,
  };
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  try {
    const response = await apiRequest({
      method: "post",
      url: "/api/verify_profile/",
      payload: payload,
      headers: headers,
      locale: locale,
    });
    return { successMessage: response.data.message, errorMessage: "" };
  } catch (error: any) {
    const texts = getTexts({ page: "general", locale: locale });
    if (error.response && error.response.data) {
      return { successMessage: "", errorMessage: error.response.data.message };
    } else if (error.request) {
      return {
        successMessage: "",
        errorMessage: texts.something_went_wrong,
      };
    } else {
      return {
        successMessage: "",
        errorMessage: texts.something_went_wrong,
      };
    }
  }
}

export default function ProfileVerified({ successMessage, errorMessage }) {
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });
  useEffect(function () {
    if (user) {
      const cookies = new Cookies();
      const postSignupRedirect = cookies.get("postSignupRedirect");
      cookies.remove("postSignupRedirect", { path: "/" });
      redirectOnLogin(user, isSafeInternalRedirect(postSignupRedirect) ? postSignupRedirect : "/", locale);
    }
  });
  return (
    <Layout title={texts.accont_verified} hideHeadline={errorMessage}>
      {successMessage !== "" && successMessage !== null ? (
        <div>
          <Typography align="center" variant="h5" component="h2">
            {successMessage}
          </Typography>
          <Typography align="center" variant="h5" color="primary" component="h2">
            <Link href={getLocalePrefix(locale) + "/signin"} underline="hover">
              {texts.click_here_to_log_in}
            </Link>
          </Typography>
        </div>
      ) : null}
      {errorMessage != "" && (
        <Typography align="center" variant="h5" color="primary" component="h2">
          {errorMessage}
        </Typography>
      )}
    </Layout>
  );
}
