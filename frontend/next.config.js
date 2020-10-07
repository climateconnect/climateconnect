const pick = require("lodash/pick");

// Google Cloud has us define environment variables in app.yaml. However, these
// environment variables are not available at build time, only at runtime. To
// get around this, we read the variables from app.yaml here.
//
// This is a bit of a hack but is fairly straightforward. If we change our
// production build setup, we should revisit this code.
let environmentVariableSource;
if (process.env.IS_BUILDING_ON_AZURE) {
  console.log("building on azure...")
  environmentVariableSource = process.env;
} else {
  console.log("not building on azure")
  require("dotenv").config();
  environmentVariableSource = process.env;
}

console.log(environmentVariableSource)
console.log(pick(environmentVariableSource, ["PRE_LAUNCH", "API_URL", "ENVIRONMENT", "SOCKET_URL"]))
module.exports = {
  env: pick(environmentVariableSource, ["PRE_LAUNCH", "API_URL", "ENVIRONMENT", "SOCKET_URL"]),
  exportPathMap: async function(defaultPathMap) {
    if (process.env.PRE_LAUNCH)
      return {
        "/": { page: "/" },
        "/zoom": { page: "/zoom" },
        "/stream": { page: "/stream" },
        "/support": { page: "/support" }
      };
    else return defaultPathMap;
  }
};
