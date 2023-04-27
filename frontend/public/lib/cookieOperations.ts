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
  const develop = ["develop", "development", "test"].includes(process.env.ENVIRONMENT as string);
  //TODO: set httpOnly=true to make cookie only accessible by server and sameSite=true
  const cookieProps = {
    path: "/",
    sameSite: develop ? false : ("lax" as "lax"),
    expires: new Date(expiry),
    secure: !develop,
    domain: undefined as string | undefined,
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
