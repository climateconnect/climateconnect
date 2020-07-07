const DEVELOPMENT = ["development", "develop", "test"].includes(process.env.ENVIRONMENT);

export function getImageUrl(url) {
  if (!url) return;
  if (DEVELOPMENT && !url.includes("http:") && !url.includes("https:")) {
    return process.env.API_URL + url;
  } else {
    return url;
  }
}
