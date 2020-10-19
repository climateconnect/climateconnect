const NECESSARY_COOKIES = [
  "acceptedNecessary",
  "acceptedStatistics",
  "csrftoken",
  "token",
  "hideInfo"
];
import Cookies from "universal-cookie";

export function removeUnnecesaryCookies() {
  const cookies = new Cookies();
  const allCookies = cookies.getAll();
  const non_essential_cookies = Object.keys(allCookies).filter(k => !NECESSARY_COOKIES.includes(k));
  non_essential_cookies.map(k => {
    cookies.remove(k, { path: "/" });
  });
}
