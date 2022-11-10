const NECESSARY_COOKIES = [
  "acceptedNecessary",
  "acceptedStatistics",
  "csrftoken",
  "auth_token",
  "hideInfo",
];
import Cookies from "universal-cookie";

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
  const develop = ["develop", "development", "test"].includes(process.env.ENVIRONMENT);
  //TODO: set httpOnly=true to make cookie only accessible by server and sameSite=true
  const cookieProps = {
    path: "/",
    sameSite: develop ? false : "lax",
    expires: new Date(expiry),
    secure: !develop,
  };
  console.log("getting cookie props");
  console.log(expiry);
  console.log(develop);
  console.log(process.env.BASE_URL_HOST);
  console.log(process.env.NEXT_PUBLIC_BASE_URL_HOST);

  if (!develop) {
    console.log("this is not develop!");
    cookieProps.domain = "." + process.env.BASE_URL_HOST;
  }
  console.log(cookieProps);
  return cookieProps;
}

export function getDisplaySignUpPromptFromCookie(cookieContent) {
  const cookies = new Cookies();
  // wasn't really sure how to handle the first time a user comes the page as the cookie being looked up is undefined at first
  if (typeof cookieContent === "undefined") {
    const expiryDate = new Date();
    const month = (expiryDate.getMonth() + 1) % 12;
    expiryDate.setMonth(month);
    const cookieProps = getCookieProps(expiryDate);
    cookies.set("display_signup_prompt", "true", cookieProps);
    return true;
  }

  return false;
}
