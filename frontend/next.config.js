const pick = require("lodash/pick");

if (!process.env.IS_BUILDING_ON_AZURE)
  require("dotenv").config();
module.exports = {
  env: pick(process.env, ["PRE_LAUNCH", "API_URL", "ENVIRONMENT", "SOCKET_URL", "API_HOST"]),
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
