const pick = require("lodash/pick");

require("dotenv").config();

module.exports = {
  // Read set variables from `.env` file
  env: pick(process.env, [
    "API_HOST",
    "API_URL",
    "BASE_URL_HOST",
    "ENVIRONMENT",
    "GOOGLE_ANALYTICS_CODE",
    "LATEST_NEWSLETTER_LINK",
    "SOCKET_URL",
    "PRE_LAUNCH",
  ]),

  exportPathMap: async function (defaultPathMap) {
    if (process.env.PRE_LAUNCH)
      return {
        "/": { page: "/" },
        "/zoom": { page: "/zoom" },
        "/stream": { page: "/stream" },
        "/donate": { page: "/donate" },
      };
    else return defaultPathMap;
  },
};
