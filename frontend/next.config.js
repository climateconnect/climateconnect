const pick = require("lodash/pick");

if (!process.env.IS_BUILDING_ON_AZURE) {
  require("dotenv").config();
}

const fallback_values = {
  API_URL: "https://api.cc-test-domain.com",
  SOCKET_URL: "wss://climateconnect-backend.azurewebsites.net",
  ENVIRONMENT: "production"
}


const environmentVariableSource = process.env;
console.log("env before")
console.log(pick(environmentVariableSource, ["PRE_LAUNCH", "API_URL", "ENVIRONMENT", "SOCKET_URL"]))
for(const key of Object.keys(fallback_values)) {
  if(fallback_values[key] === undefined)
    environmentVariableSource[key] = fallback_values[key]
}
console.log("env after")
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
