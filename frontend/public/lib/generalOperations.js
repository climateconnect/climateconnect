export function getParams(url) {
  if (!url) return [];
  const paramContent = url.split("?")[1];
  if (!paramContent) return [];
  const rawParams = paramContent.split("&");
  return rawParams.reduce((obj, param) => {
    obj[param.split("=")[0]] = param.split("=")[1];
    return obj;
  }, {});
}

export function isOnScreen(el) {
  if (!el) return false;
  else {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ &&
      rect.right <=
        (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }
}
