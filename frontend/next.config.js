const pick = require("lodash/pick");

require("dotenv").config();
module.exports = {
  env: pick(process.env, ["PRE_LAUNCH", "API_URL", "ENVIRONMENT", "SOCKET_URL", "API_HOST"]),
  exportPathMap: async function(defaultPathMap) {
    if (process.env.PRE_LAUNCH)
      return {
        "/": { page: "/" },
        "/zoom": { page: "/zoom" },
        "/stream": { page: "/stream" },
        "/donate": { page: "/donate" }
      };
    else return defaultPathMap;
  }
};
