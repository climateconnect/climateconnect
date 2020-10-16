import React from "react";
import { Typography, Link } from "@material-ui/core";
import Layout from "../../src/components/layouts/layout";
import axios from "axios";

ProfileVerified.getInitialProps = async ctx => {
  const uuid = encodeURI(ctx.query.uuid);
  const messages = await profileVerification(uuid);
  return {
    successMessage: messages["successMessage"],
    errorMessage: messages["errorMessage"]
  };
};

async function profileVerification(uuid) {
  const payload = {
    uuid: uuid
  };
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  };
  try {
    const response = await axios.post(
      process.env.API_URL + "/api/verify_profile/",
      payload,
      config
    );
    return { successMessage: response.data.message, errorMessage: "" };
  } catch (error) {
    if (error.response && error.response.data) {
      return { successMessage: "", errorMessage: error.response.data.message };
    } else if (error.request) {
      return {
        successMessage: "",
        errorMessage: "Something went wrong. Please contact our support team."
      };
    } else {
      return {
        successMessage: "",
        errorMessage: "Something went wrong. Please contact our support team."
      };
    }
  }
}

export default function ProfileVerified({ successMessage, errorMessage }) {
  return (
    <Layout title="Account Verified">
      {successMessage != "" ? (
        <div>
          <Typography align="center" variant="h5" component="h2">
            {successMessage}
          </Typography>
          <Typography align="center" variant="h5" color="primary" component="h2">
            <Link href="/signin">Click here to log in</Link>
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
