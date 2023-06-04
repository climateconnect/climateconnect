import { Typography } from "@mui/material";
import cookies from "next-cookies";
import React, { useContext, useEffect } from "react";
import { apiRequest, redirect, sendToLogin } from "../../public/lib/apiOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import Layout from "../../src/components/layouts/layout";

export async function getServerSideProps(ctx) {
  const uuid = encodeURI(ctx.query.uuid);
  const { auth_token } = cookies(ctx);
  if (ctx.req && !auth_token) {
    const texts = getTexts({ page: "activate_email", locale: ctx.locale });
    const message = texts.log_in_to_verify_email;
    return sendToLogin(ctx, message);
  }
  return {
    props: {
      uuid: uuid,
      token: auth_token,
    },
  };
}

async function newEmailVerification(uuid, token, locale) {
  const payload = {
    uuid: uuid,
  };
  try {
    const response = await apiRequest({
      method: "post",
      url: "/api/verify_new_email/",
      payload: payload,
      token: token,
      locale: locale,
    });
    redirect("/browse", {
      message: response.data.message,
    });
  } catch (error: any) {
    const errortexts = getTexts({ page: "general", locale: locale });
    if (error.response && error.response.data) {
      if (error.response.data.detail)
        redirect("/browse", { errorMessage: error.response.data.detail });
      else redirect("/browse", { errorMessage: error.response.data.message });
    } else if (error.request) {
      redirect("/browse", {
        errorMessage: errortexts.something_went_wrong,
      });
    } else {
      redirect("/browse", {
        errorMessage: errortexts.something_went_wrong,
      });
    }
  }
}

export default function ActivateEmail({ uuid, token }) {
  const [sentRequest, setSentRequest] = React.useState(false);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });
  useEffect(function () {
    if (!sentRequest) {
      console.log("sending new email verification request!");
      newEmailVerification(uuid, token, locale);
      setSentRequest(true);
    }
  });
  return (
    <Layout title={texts.new_email_verification}>
      <Typography>{texts.verifying_new_email}</Typography>
    </Layout>
  );
}
