import axios from "axios";
import tokenConfig from "../config/tokenConfig";
import Router from "next/router";
import getEnvVar from "./getEnvVar";

export async function apiRequest(method, url, token, payload, throwError) {
  if (payload) {
    axios[method](getEnvVar("API_URL") + url, payload, tokenConfig(token))
      .then(function(response) {
        return Promise.resolve(response);
      })
      .catch(function(error) {
        console.log(error);
        if (throwError) throw error;
      });
  } else {
    axios[method](getEnvVar("API_URL") + url, tokenConfig(token))
      .then(function(response) {
        return Promise.resolve(response);
      })
      .catch(function(error) {
        console.log(error);
        if (throwError) throw error;
      });
  }
}

const config = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
};

export async function resendEmail(email, onSuccess, onError) {
  axios
    .post(getEnvVar("API_URL") + "/api/resend_verification_email/", { email: email }, config)
    .then(function(resp) {
      onSuccess(resp);
    })
    .catch(function(error) {
      console.log(error);
      onError(error);
    });
}

export async function redirect(url, messages) {
  Router.push({
    pathname: url,
    query: messages
  });
}
