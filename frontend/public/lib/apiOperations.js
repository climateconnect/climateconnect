import axios from "axios";
import Router from "next/router";
import tokenConfig from "../config/tokenConfig";

export async function apiRequest(method, url, token, payload, throwError) {
  if (payload) {
    axios[method](process.env.API_URL + url, payload, tokenConfig(token))
      .then(function (response) {
        return Promise.resolve(response);
      })
      .catch(function (error) {
        console.log(error);
        if (throwError) throw error;
      });
  } else {
    axios[method](process.env.API_URL + url, tokenConfig(token))
      .then(function (response) {
        return Promise.resolve(response);
      })
      .catch(function (error) {
        console.log(error);
        if (throwError) throw error;
      });
  }
}

const config = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

export async function resendEmail(email, onSuccess, onError) {
  axios
    .post(process.env.API_URL + "/api/resend_verification_email/", { email: email }, config)
    .then(function (resp) {
      onSuccess(resp);
    })
    .catch(function (error) {
      console.log(error);
      onError(error);
    });
}

export async function redirect(url, messages) {
  Router.push({
    pathname: url,
    query: messages,
  });
}

export async function sendToLogin(ctx, message, locale, relativePath) {
  const path = relativePath ? relativePath : ctx.asPath;
  const pathName = path.substr(1, path.length);
  const languagePrefix = locale === "en" ? "" : `/${locale}`;
  const url = languagePrefix + "/signin?redirect=" + pathName + "&message=" + message;
  ctx.res.writeHead(302, { Location: url });
  ctx.res.end();
  return;
}

export function getLocalePrefix(locale) {
  if (locale === "en") return "";
  else return `/${locale}`;
}
