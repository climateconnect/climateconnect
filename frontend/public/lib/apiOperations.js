import axios from "axios";
import Router from "next/router";
import tokenConfig from "../config/tokenConfig";

export async function apiRequest({
  method,
  url,
  token,
  payload,
  shouldThrowError,
  locale,
  headers,
}) {
  console.log("url: " + url);
  const acceptLanguageHeadersByLocale = {
    de: "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    en: "en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7",
  };
  const additionalHeaders = headers ? headers : {};
  if (locale && acceptLanguageHeadersByLocale[locale]) {
    additionalHeaders["Accept-Language"] = acceptLanguageHeadersByLocale[locale];
  }
  const config = tokenConfig(token, additionalHeaders);
  if (payload) {
    try {
      const response = await axios[method](process.env.API_URL + url, payload, config);
      return response;
    } catch (error) {
      console.log(error)
      console.log(error?.response);
      if (shouldThrowError) throw error;
    }
  } else {
    try {
      const response = axios[method](process.env.API_URL + url, config);
      return response;
    } catch (error) {
      console.log(error?.response);
      if (shouldThrowError) throw error;
    }
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
