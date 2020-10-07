const pick = require("lodash/pick");

if (!process.env.IS_BUILDING_ON_AZURE) {
  require("dotenv").config();
}

const environmentVariableSource = process.env;

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
