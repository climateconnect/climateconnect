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

//@propertyName can be of format "info.short_description" which wil then catch obj[info][short_description]
export function getNestedValue(obj, propertyName) {
  //short circuit if the property is on the first level
  if (!propertyName.includes(".")) return obj[propertyName];
  let propertyToReturn = obj;
  for (const curLevelProperty of propertyName.split(".")) {
    if (!propertyToReturn) return null;
    propertyToReturn = propertyToReturn[curLevelProperty];
  }
  return propertyToReturn;
}

export function arraysEqual(_arr1, _arr2) {
  if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) return false;

  var arr1 = _arr1.concat().sort();
  var arr2 = _arr2.concat().sort();
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}
