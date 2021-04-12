import { Link, Typography } from "@material-ui/core";
import axios from "axios";
import React, { useContext, useEffect } from "react";
import { getLocalePrefix } from "../../public/lib/apiOperations";
import { redirectOnLogin } from "../../public/lib/profileOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import Layout from "../../src/components/layouts/layout";

export async function getServerSideProps({ query, locale }) {
  const uuid = encodeURI(query.uuid);
  const messages = await profileVerification(uuid, locale);
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
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Language": locale,
    },
  };
  try {
    const response = await axios.post(
      process.env.API_URL + "/api/verify_profile/",
      payload,
      config
    );
    return { successMessage: response.data.message, errorMessage: "" };
  } catch (error) {
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
      redirectOnLogin(user, "/", locale);
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
            <Link href={getLocalePrefix(locale) + "/signin"}>{texts.click_here_to_log_in}</Link>
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
