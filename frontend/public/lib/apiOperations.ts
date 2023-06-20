import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import Router from "next/router";
import { CcLocale } from "../../src/types";
import tokenConfig from "../config/tokenConfig";
import type { UrlObject } from "url";
import { ParsedUrlQueryInput } from "querystring";
import { GetServerSidePropsContext } from "next/types";

type Args = {
  method: Method;
  url: string;
  token?: string;
  payload?: any;
  locale?: CcLocale;
  headers?: object;
};
// Typed apiRequest method
// Defaults to any to prevent compiler issues wherever its called and there is not type being passed.
export const apiRequest = async <T = any>(args: Args) => {
  const { method, url, token, payload, locale, headers = {} } = args;

  const acceptLanguageHeadersByLocale = {
    de: "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    en: "en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7",
  };

  if (locale && acceptLanguageHeadersByLocale[locale]) {
    headers["Accept-Language"] = acceptLanguageHeadersByLocale[locale];
  }
  const config: AxiosRequestConfig = tokenConfig(token, headers);

  const requestPromise: Promise<AxiosResponse<T>> = payload
    ? axios[method](process.env.API_URL + url, payload, config)
    : axios[method](process.env.API_URL + url, config);

  // Handle promise result wherever this method is called, either on a try catch block or with .then | .catch methods.
  return requestPromise;
};

const config: AxiosRequestConfig = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

export const resendEmail = async <T = any>(
  email: string,
  onSuccess: (resp: AxiosResponse<T>) => void,
  onError: (err: AxiosError) => void
) => {
  axios
    .post<T>(process.env.API_URL + "/api/resend_verification_email/", { email }, config)
    .then((resp) => onSuccess(resp))
    .catch((error: AxiosError) => {
      console.log(error);
      onError(error);
    });
};

export const redirect = (
  pathname: string,
  messages: string | ParsedUrlQueryInput,
  hash?: string
) => {
  const payload: UrlObject = {
    pathname,
    query: messages,
    hash,
  };

  Router.push(payload);
};

export const sendToLogin = async (
  { resolvedUrl, locale, res }: GetServerSidePropsContext,
  message: string
) => {
  const pathName = resolvedUrl.slice(1);
  const languagePrefix = locale === "en" ? "" : `/${locale}`;
  const url = languagePrefix + "/signin?redirect=" + pathName + "&message=" + message;
  res.writeHead(302, { Location: url });
  res.end();
  return;
};

export function getLocalePrefix(locale: string) {
  return locale === "en" ? "" : `/${locale}`;
}

export const getRolesOptions = async (token: string | undefined, locale: CcLocale) => {
  try {
    const { data } = await apiRequest({
      method: "get",
      url: "/roles/",
      token,
      locale,
    });
    if (data.results.length === 0) return null;
    else {
      return data.results;
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(err);
      if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
      return null;
    }
  }
};
