export function getParams(url) {
  if(!url)
    return []
  const paramContent = url.split("?")[1];
  console.log(paramContent)
  if(!paramContent) 
    return []
  const rawParams = paramContent.split("&");
  console.log(rawParams.map(param => {
    return {
      [param.split("=")[0]]: param.split("=")[1]
    };
  }))
  return rawParams.reduce((obj, param) => {
    obj[param.split("=")[0]] = param.split("=")[1]
    return obj
  }, {});
}
