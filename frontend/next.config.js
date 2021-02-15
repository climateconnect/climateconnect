const pick = require("lodash/pick");

require("dotenv").config();

module.exports = {
  // Read set variables from `.env` file
  env: pick(process.env, [
    "API_HOST",
    "API_URL",
    "BASE_URL_HOST",
    "DONATION_CAMPAIGN_RUNNING",
    "ENVIRONMENT",
    "GOOGLE_ANALYTICS_CODE",
    "LATEST_NEWSLETTER_LINK",
    "SOCKET_URL",
    "LETS_ENCRYPT_FILE_CONTENT",
  ]),

  exportPathMap: async function (defaultPathMap) {
    return defaultPathMap;
  },
};
