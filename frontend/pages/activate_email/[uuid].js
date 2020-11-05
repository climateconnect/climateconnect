import React, { useContext, useEffect } from "react";
import { Typography } from "@material-ui/core";
import Layout from "../../src/components/layouts/layout";
import axios from "axios";
import tokenConfig from "../../public/config/tokenConfig";
import { redirect, sendToLogin } from "../../public/lib/apiOperations";
import cookies from "next-cookies";

ActivateEmail.getInitialProps = async ctx => {
  const uuid = encodeURI(ctx.query.uuid);
  const { token } = cookies(ctx);
  if (ctx.req && !token) {
    const message = "You have to log in to verify your new email.";
    return sendToLogin(ctx, message);
  }
  return {
    uuid: uuid,
    token: token
  };
};

async function newEmailVerification(uuid, token) {
  const payload = {
    uuid: uuid
  };
  try {
    const response = await axios.post(
      process.env.API_URL + "/api/verify_new_email/",
      payload,
      tokenConfig(token)
    );
    redirect("/browse", {
      message: response.data.message
    });
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.detail)
        redirect("/browse", { errorMessage: error.response.data.detail });
      else redirect("/browse", { errorMessage: error.response.data.message });
    } else if (error.request) {
      redirect("/browse", {
        errorMessage: "Something went wrong. Please contact our support team."
      });
    } else {
      redirect("/browse", {
        errorMessage: "Something went wrong. Please contact our support team."
      });
    }
  }
}

export default function ActivateEmail({ uuid, token }) {
  const [sentRequest, setSentRequest] = React.useState(false);
  useEffect(function() {
    if (!sentRequest) {
      console.log("sending new email verification request!");
      newEmailVerification(uuid, token);
      setSentRequest(true);
    }
  });
  return (
    <Layout title="New Email Verification">
      <Typography>Verifying your new E-Mail address...</Typography>
    </Layout>
  );
}
