import React, { useContext } from "react";
import { Typography } from "@material-ui/core";
import Layout from "../../src/components/layouts/layout";
import axios from "axios";
import tokenConfig from "../../public/config/tokenConfig";
import Cookies from "universal-cookie";
import UserContext from "../../src/components/context/UserContext";
import LoginNudge from "../../src/components/general/LoginNudge";
import { redirect } from "../../public/lib/apiOperations";

ProfileVerified.getInitialProps = async ctx => {
  const uuid = encodeURI(ctx.query.uuid);
  return {
    uuid: uuid
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
    redirect("/", {
      message: response.data.message
    });
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.detail) redirect("/", { errorMessage: error.response.data.detail });
      else redirect("/", { errorMessage: error.response.data.message });
    } else if (error.request) {
      redirect("/", {
        errorMessage: "Something went wrong. Please contact our support team."
      });
    } else {
      redirect("/", {
        errorMessage: "Something went wrong. Please contact our support team."
      });
    }
  }
}

export default function ProfileVerified({ uuid }) {
  const { user } = useContext(UserContext);
  if (user) {
    const cookies = new Cookies();
    const token = cookies.get("token");
    newEmailVerification(uuid, token);
    return (
      <Layout title="New Email Verification">
        <Typography>Verifying your new E-Mail address...</Typography>
      </Layout>
    );
  } else {
    return (
      <Layout title="New Email Verification">
        <LoginNudge whatTodo=" verify your new E-Mail address" />
      </Layout>
    );
  }
}
