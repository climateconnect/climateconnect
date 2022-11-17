import axios from "axios";
import Router from "next/router";
import { CcLocale } from "../../src/types";
import tokenConfig from "../config/tokenConfig";

type Args = {
  method: string;
  url: string;
  token?: string;
  payload?: any;
  shouldThrowError?: boolean;
  locale?: CcLocale;
  headers?: object;
};
export async function apiRequest({
  method,
  url,
  token,
  payload,
  shouldThrowError = true,
  locale,
  headers,
}: Args) {
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
    } catch (error: any) {
      console.log(error);
      console.log(error?.response);
      if (shouldThrowError) throw error;
    }
  } else {
    try {
      const response = axios[method](process.env.API_URL + url, config);
      return response;
    } catch (error: any) {
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

export async function redirect(url, messages, hash?) {
  const payload = {
    pathname: url,
    query: messages,
    forceRedirect: true,
    hash: undefined,
  };
  if (hash) payload.hash = hash;
  Router.push(payload);
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

export function getLocalePrefix(locale: string) {
  if (locale === "en") return "";
  else return `/${locale}`;
}

export async function getRolesOptions(token: string | undefined, locale: any) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/roles/",
      token: token,
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}
