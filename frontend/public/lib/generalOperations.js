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
