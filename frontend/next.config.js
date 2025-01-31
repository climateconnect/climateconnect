const pick = require("lodash/pick");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

require("dotenv").config();

module.exports = withBundleAnalyzer({
  // Read set variables from `.env` file
  //For CUSTOM_HUB_URLS use a string of urls split by commas, e.g. CUSTOM_HUB_URLS="url1,url2,url3"
  env: pick(process.env, [
    "API_HOST",
    "API_URL",
    "BASE_URL",
    "BASE_URL_HOST",
    "CUSTOM_HUB_URLS",
    "DONATION_CAMPAIGN_RUNNING",
    "ENABLE_LEGACY_LOCATION_FORMAT",
    "ENVIRONMENT",
    "GOOGLE_ANALYTICS_CODE",
    "LATEST_NEWSLETTER_LINK",
    "LETS_ENCRYPT_FILE_CONTENT",
    "SOCKET_URL",
    "WEBFLOW_API_TOKEN",
    "WEBFLOW_SITE_ID",
  ]),
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
  },
  exportPathMap: async function (defaultPathMap) {
    return defaultPathMap;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/browse",
        has: [
          {
            type: "cookie",
            key: "auth_token",
          },
        ],
        permanent: false,
      },
      {
        source: "/spenden",
        destination: "/de/donate",
        permanent: true,
      },
      {
        source: "/spendenwald",
        destination: "/de/donate",
        // disabled redirect to donorforest for now
        // as the donorforest is not up to date
        // destination: "/de/donorforest",
        permanent: true,
      },
      {
        source: "/klimakuechen-erlangen",
        destination: "/de/projects/klimakuechen?hubPage=erlangen",
        permanent: true,
      },
      {
        source: "/blog/weihnachten",
        destination: "/post/es-ist-weihnachtszeit-auf-climate-connect",
        permanent: true,
      },
    ];
  },
});
