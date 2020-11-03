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

export function getPath(url) {
  if(!url) return ""
  const url_without_protocol = url.split("//")[1]
  const paramsIndex = url_without_protocol.indexOf("?")
  return url_without_protocol.substr(url_without_protocol.indexOf("/")+1, paramsIndex>=0 ? paramsIndex : url_without_protocol.length)
}