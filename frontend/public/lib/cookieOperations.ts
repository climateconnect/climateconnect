import Cookies from "universal-cookie";
import { CC_ENVIRONMENT_COOKIE, detectEnvironment } from "./environmentOperations";

const NECESSARY_COOKIES = [
  "acceptedNecessary",
  "acceptedStatistics",
  "csrftoken",
  "auth_token",
  "hideInfo",
  CC_ENVIRONMENT_COOKIE,
];

export function removeUnnecesaryCookies() {
  const cookies = new Cookies();
  const allCookies = cookies.getAll();
  const non_essential_cookies = Object.keys(allCookies).filter(
    (k) => !NECESSARY_COOKIES.includes(k)
  );
  non_essential_cookies.map((k) => {
    cookies.remove(k, { path: "/" });
  });
}

export function getCookieProps(expiry) {
  const environment = detectEnvironment();
  const develop = environment === "development";
  //TODO: set httpOnly=true to make cookie only accessible by server and sameSite=true
  const cookieProps = {
    path: "/",
    sameSite: develop ? false : ("lax" as "lax"),
    expires: new Date(expiry),
    secure: !develop,
    domain: undefined as string | undefined,
  };

  if (environment === "production") {
    // Set domain only in production to support subdomain cookie sharing.
    // Staging and development don't need cross-subdomain cookies.
    cookieProps.domain = "." + process.env.BASE_URL_HOST;
  }
  return cookieProps;
}
