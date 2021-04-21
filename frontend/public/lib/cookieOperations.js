const NECESSARY_COOKIES = [
  "acceptedNecessary",
  "acceptedStatistics",
  "csrftoken",
  "token",
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
  console.log("getting cookie props")
  console.log(expiry)
  console.log(develop)
  console.log(process.env)
  console.log(process.env.API_HOST)

  if (!develop) {
    console.log("this is not develop!")
    cookieProps.domain = "." + process.env.API_HOST;
  }
  console.log(cookieProps)
  return cookieProps;
}
