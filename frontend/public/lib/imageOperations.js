const DEVELOPMENT = ["development", "develop", "test"].includes(process.env.ENVIRONMENT);

export function getImageUrl(url) {
  if (!url) return;
  if (DEVELOPMENT && !url.includes("http:") && !url.includes("https:")) {
    return process.env.API_URL + url;
  } else {
    return url;
  }
}

export function getImageDialogHeight(screenWidth) {
  console.log((screenWidth / 16) * 9);
  return (screenWidth / 16) * 9 * 0.7;
}
